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
export function wrapSocket<T>(ws: WebSocketProxy, jose?: IJoseVerify) {
  ws.jose = jose
  return new Proxy(ws, {
    get: (target, prop, receiver) => {
      switch (prop) {
        case 'on':
          return customOn.bind(target)
        case 'send':
          return customSend.bind(target)
      }

      return Reflect.get(target, prop, receiver)
    },
  }) as T
}

async function customOn(
  this: WebSocketProxy,
  event: string,
  listener: (...args: any[]) => void,
) {
  
  return this.on(event, customListener)

  async function customListener(this: WebSocketProxy, ...args: any[]) {
    if (event === 'message') {
      let [data, isBinary] = args as | [BufferLike, boolean]

      if (!this.jose) {
        logger.debug('Receiving: jose not initialized', data)

        return listener.call(this, data, isBinary)
      }

      const { payload, ...jws } = await verify(data.toString(), this.jose.jwks)

      logger.debug('Receiving payload"', { payload })

      return listener.call(
        this,
        JSON.stringify({ ...jws, ...(payload as object) }),
        isBinary,
      )
    }

    logger.debug('Receiving', event, args)

    listener.call(this, ...args)
  }
}

async function customSend(
  this: WebSocketProxy,
  data: BufferLike,
  cb?: (error?: Error) => void,
) {
  if (!this.jose) {
    logger.debug('Sending: jose not initialized', data)
    return this.send(data, cb)
  }

  logger.debug('Signing payload: ', { payload: data, jose: this.jose })

  const jws = await sign(this.jose.key, {
    payload: JSON.parse(data.toString()),
  })

  logger.debug('Sending', jws)

  this.send(jws, cb)
}
