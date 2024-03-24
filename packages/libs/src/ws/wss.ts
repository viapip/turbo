import consola from 'consola'
import { WebSocketServer } from 'ws'

import { wrapSocket } from './ws'

import type { ServerOptions, WebSocket } from 'ws'
import { IJoseData, KeyPair } from '@/jose/types'

const logger = consola.withTag('wss')

// declare module 'ws' {
//   interface WebSocketServer {
//     jose?: IJoseSourceData
//   }
// }

export class WebSocketServerProxy extends WebSocketServer {
  jose?: IJoseData
  public constructor(options?: ServerOptions, jose?: IJoseData, callback?: () => void) {
    super(options, callback)
    this.jose = jose
    logger.info('new WebSocketServer', jose)
    // return wrapSocketServer(this)
  }
}

export function wrapSocketServer(wss: WebSocketServer) {
  return new Proxy(wss, {
    get: (target, prop, receiver) => {
      if (prop === 'on') {
        return customOn.bind(target)
      }

      return Reflect.get(target, prop, receiver)
    },
  })
}

async function customOn(
  this: WebSocketServer,
  event: string,
  listener: (...args: any[]) => void,
) {
  this.on(event, async (...args: any[]) => {
    if (event === 'connection') {
      logger.info('Connection')
      args[0] = wrapSocket(args[0] as WebSocket, this.jose)
    }

    listener.call(this, ...args)
  })
}
