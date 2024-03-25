import consola from 'consola'

import { jwks, keys1 } from '../jose/keys'
import { sign, verify } from '../jose/sign'

import type { KeyPair } from '../jose/types'

type BufferLike =
  | string
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
  ) {
    super(address, protocols)

    // return wrapSocket(this)
  }
}

export function wrapSocket(ws: WebSocket) {
  return new Proxy(ws, {
    get: (target, prop) => {
      switch (prop) {
        case 'addEventListener':
          return customOn.bind(target)
        case 'send':
          return customSend.bind(target)
      }

      return Reflect.get(target, prop)
    },
  })
}

async function customOn(
  this: WebSocket,
  event: string,
  listener: (...args: any[]) => void,
) {
  this.addEventListener(event, async (...args: any[]) => {
    if (event === 'message') {
      const [data, isBinary] = args as [BufferLike, boolean]
      const jws = await verify(data.toString(), jwks)
      consola.log('Receiving', event, JSON.stringify(jws))

      listener.call(this, JSON.stringify(jws), isBinary)

      return
    }

    listener.call(this, ...args)
  })
}

async function customSend(
  this: WebSocket,
  data: BufferLike,
  // cb?: (error?: Error) => void,
) {
  // console.log('Sending', data)

  const jws = await sign(keys1 as KeyPair, JSON.parse(data.toString()))
  consola.log('Sending', jws)

  this.send(jws)
}
