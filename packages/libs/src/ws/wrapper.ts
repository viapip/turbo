import { WebSocketBrowserProxy } from './browser'
import type { WebSocketProxy } from './ws'

import { sign, verify } from '../jose/sign'
import { IJoseVerify } from '../jose/types'

import consola from 'consola'
import { JWTPayload } from 'jose'

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

const logger = consola.withTag('ws')
export function wrapSocket<T>(
  ws: WebSocketProxy | WebSocketBrowserProxy,
  jose?: IJoseVerify,
) {
  ws.jose = jose
  const isBrowser = ws instanceof WebSocketBrowserProxy
  return new Proxy(ws, {
    get: (target, prop, receiver) => {
      switch (prop) {
        case 'on':
          if (!isBrowser) {
            return customOn.bind(target)
          }
          break
        case 'addEventListener':
          if (isBrowser) {
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
  listener: (...args: any[]) => void,
) {
  const isBrowser = this instanceof WebSocketBrowserProxy

  if (!isBrowser) {
    this.on(event, customListener)
    return
  }

  (this as WebSocket).addEventListener(event, customListener)

  async function customListener(
    this: WebSocketProxy | WebSocketBrowserProxy,
    ...args: any[]
  ) {
    if (event === 'message') {
      const [data, isBinary] = args as [BufferLike, boolean]

      console.log('customOn', data.toString())

      if (!this.jose) {
        return listener.call(this, data, isBinary)
      }

      logger.info('before verify', this.jose)

      const { payload , ...jws} = await verify(data.toString(), this.jose.jwks)
      
      logger.log('Receiving', event, JSON.stringify(payload))

      listener.call(this, JSON.stringify({...jws, ...payload as object}), isBinary)

      return
    }

    logger.log('Receiving', event, args)
    
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
    return isBrowser
      ? (this as WebSocket).send(data as string)
      : this.send(data, cb)
  }
  
  logger.info('before send:data', data)
  logger.info('before send:jose', this.jose)


  const jws = await sign(this.jose.key, {
    payload: JSON.parse(data.toString())
  })

  logger.log('Sending', jws)

  isBrowser ? (this as WebSocket).send(jws) : this.send(jws, cb)
}
