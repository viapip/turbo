import consola from 'consola'
import { WebSocket } from 'ws'

import { jwks, keys1 } from '@/jose/keys'
import { sign, verify } from '@/jose/sign'

import type { Buffer } from 'node:buffer'
import type { ClientOptions } from 'ws'
import { IJoseData } from '@/jose/types'

const logger = consola.withTag('ws')

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

export class WebSocketProxy extends WebSocket {
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    options?: ClientOptions,
    jose?: IJoseData
  ) {
    super(address, protocols, options)
    // return wrapSocket(this, jose)
  }
}

export function wrapSocket(ws: WebSocket, jose?: IJoseData ) {
  ws['jose'] = jose
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
  })
}

async function customOn(
  this: WebSocket,
  event: string,
  listener: (...args: any[]) => void,
) {
  this.on(event, async (...args: any[]) => {
    if (event === 'message') {
      const [data, isBinary] = args as [BufferLike, boolean]

      console.log('customOn', data);
      const jws = await verify(data.toString(), jwks)
      logger.log('Receiving', event, JSON.stringify(jws))

      listener.call(this, JSON.stringify(jws), isBinary)

      return
    }

    listener.call(this, ...args)
  })
}

async function customSend(
  this: WebSocket,
  data: BufferLike,
  cb?: (error?: Error) => void,
) {
  console.log('customSend', data);

  if(!this.jose) {
    return this.send(data, cb)
  }

  const jws = await sign(this.jose.key, JSON.parse(data.toString()))
  logger.log('Sending', jws)

  this.send(jws, cb)
}
