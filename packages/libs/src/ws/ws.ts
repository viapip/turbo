import consola from 'consola'
import {WebSocket as WebSocketNode} from 'ws'

import { sign, verify } from '@/jose/sign'

import type { Buffer } from 'node:buffer'
import type { ClientOptions } from 'ws'
import { IJoseVerify } from '@/jose/types'
import  { WebSocketBrowserProxy } from './browser'

const logger = consola.withTag('ws')

declare module 'ws' {
  export interface WebSocketServer {
    jose?: IJoseVerify
  }
  export interface WebSocket {
    jose?: IJoseVerify
  }
}

declare global {
  export interface WebSocket {
    jose?: IJoseVerify
  }
}

type BufferLike =
  | string
  | Buffer
  | DataView
  | number
  | ArrayBufferView
  | Uint8Array
  | ArrayBuffer
  | SharedArrayBuffer
  | readonly any[]
  | readonly number[]
  | { valueOf: () => ArrayBuffer }
  | { valueOf: () => SharedArrayBuffer }
  | { valueOf: () => Uint8Array }
  | { valueOf: () => readonly number[] }
  | { valueOf: () => string }
  | { [Symbol.toPrimitive]: (hint: string) => string }

export class WebSocketProxy extends WebSocketNode {
  public jose?: IJoseVerify
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    options?: ClientOptions,
    jose?: IJoseVerify,
  ) {
    super(address, protocols, options)
    this.jose = jose
    return wrapSocket(this)
  }
}

export function wrapSocket<T>(
  ws: WebSocketProxy | WebSocketBrowserProxy,
  jose?: IJoseVerify,
) {
  ws.jose = jose
  const isBrowser = WebSocketBrowserProxy && ws instanceof WebSocketBrowserProxy
  return new Proxy(ws, {
    get: (target, prop, receiver) => {
      switch (prop) {
        case 'on':
          return customOn.bind(target)
        case 'addEventListener': 
          if(isBrowser) {
            logger.info('proxy:isBrowser', isBrowser)
            return customOn.bind(target)
          }
          break
        case 'send':
          return customSend.bind(target)
      }

      return Reflect.get(target, prop, receiver)
    },
  }) as T
}

async function customOn(
  this: WebSocketProxy | WebSocketBrowserProxy,
  event: string,
  listener: (...args: any[]) => void
) {
  
  const isBrowser = this instanceof WebSocketBrowserProxy

  if (!isBrowser) {
    this.on(event, customListener)
    return 
  }

  (this as WebSocket).addEventListener(event, customListener)


  async function customListener (this: WebSocketProxy | WebSocketBrowserProxy, ...args: any[]) {
    if (event === 'message') {
      const [data, isBinary] = args as [BufferLike, boolean]

      console.log('customOn', data)

      if (!this.jose) {
        return listener.call(this, data, isBinary)
      }
      
      const jws = await verify(data.toString(), this.jose.jwks)
      logger.log('Receiving', event, JSON.stringify(jws))

      listener.call(this, JSON.stringify(jws), isBinary)

      return
    }

    listener.call(this, ...args)
  }
}

async function customSend(
  this: WebSocketProxy | WebSocketBrowserProxy,
  data: BufferLike,
  cb?: (error?: Error) => void,
) {
  console.log('customSend', data)
  const isBrowser = this instanceof WebSocketBrowserProxy

  if (!this.jose) {
    return isBrowser ? (this as WebSocket).send(data as string) : this.send(data, cb)
  }
  logger.info('before send', data)
  const jws = await sign(this.jose.key, JSON.parse(data.toString()))
  
  logger.log('Sending', jws)
  
  isBrowser? (this as WebSocket).send(jws) : this.send(jws, cb)
}
