import consola from 'consola'
import WebSocketNode from 'ws'

import { sign, verify } from '@/jose/sign'

import type { Buffer } from 'node:buffer'
import type { ClientOptions } from 'ws'
import { IJoseData } from '@/jose/types'
import { WebSocketBrowserProxy } from './browser'

const logger = consola.withTag('ws')

declare module 'ws' {
  export interface WebSocketServer {
    jose?: IJoseData
  }
  export interface WebSocket {
    jose?: IJoseData
  }
}

declare global {
  export interface WebSocket {
    jose?: IJoseData
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

export class WebSocketProxy extends WebSocketNode.WebSocket {
  jose?: IJoseData
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    options?: ClientOptions,
    jose?: IJoseData,
  ) {
    super(address, protocols, options)
    this.jose = jose
    return wrapSocket(this)
  }
}

export function wrapSocket<T>(
  ws: WebSocketProxy | WebSocketBrowserProxy,
  jose?: IJoseData,
) {
  ws.jose = jose
  return new Proxy(ws, {
    get: (target, prop, receiver) => {
      switch (prop) {
        case 'on':
          return customOn.bind(target)
        case 'addEventListener':
          return customOn.bind(target)
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

  this.addEventListener(event, customListener)


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
    return isBrowser ? this.send(data as string) : this.send(data, cb)
  }

  const jws = await sign(this.jose.key, JSON.parse(data.toString()))
  
  logger.log('Sending', jws)
  
  isBrowser? this.send(jws) : this.send(jws, cb)
}
