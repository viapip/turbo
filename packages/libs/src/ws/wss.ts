import consola from 'consola'
import { WebSocketServer } from 'ws'

import { wrapSocket } from './wrapper'

import type { IJoseVerify } from '../jose/types'
import type { ServerOptions, WebSocket } from 'ws'

const logger = consola.withTag('wss')

export class WebSocketServerProxy extends WebSocketServer {
  jose?: IJoseVerify
  public constructor(options?: ServerOptions, jose?: IJoseVerify, callback?: () => void) {
    super(options, callback)
    this.jose = jose
    logger.info('new WebSocketServer', jose)
    return wrapSocketServer(this)
  }
}

export function wrapSocketServer(wss: WebSocketServer) {
  return new Proxy(wss, {
    get: (target, prop, receiver) => {
      if (prop === 'on')
        return customOn.bind(target)

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
