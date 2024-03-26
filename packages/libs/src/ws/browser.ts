import consola from 'consola'
import { IJoseVerify } from '../jose/types'

import { sign, verify } from '../jose/sign'

export * from './types'

export class WebSocketBrowserProxy extends WebSocket {
  jose?: IJoseVerify
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    jose?: IJoseVerify,
  ) {
    super(address, protocols)
    this.jose = jose

    return wrapSocket(this)
  }
}

export function wrapSocket<T>(ws: WebSocketBrowserProxy) {
  return new Proxy(ws, {
    get: (target, prop) => {
      logger.debug('Getting', prop, target)
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

type BufferLike = string | ArrayBufferView | ArrayBufferLike | Blob

const logger = consola.withTag('ws/browser')

async function customOn(
  this: WebSocketBrowserProxy,
  event: string,
  listener: (...args: any[]) => void,
) {
  this.addEventListener(event, customListener)

  async function customListener(this: WebSocketBrowserProxy, ...args: any[]) {
    if (event === 'message') {
      let [event] = args as [MessageEvent<string>]
      let data = event.data

      if (!this.jose) {
        logger.debug('Receiving: jose not initialized', data)

        return listener.call(this, event)
      }

      const { payload, ...jws } = await verify(data.toString(), this.jose.jwks)

      const newEvent = createMessageEvent(payload, event)

      logger.debug('Receiving payload"', { payload, event: newEvent })

      return listener.call(this, newEvent)
    }

    logger.debug('Receiving', event, args)

    return listener.call(this, ...args)
  }
}

function createMessageEvent(payload: unknown, event: MessageEvent) {
  return new MessageEvent('message', {
    data: JSON.stringify(payload),
    origin: event.origin,
    source: event.source,
    lastEventId: event.lastEventId,
    ports: [...event.ports],
  })
}

async function customSend(this: WebSocketBrowserProxy, data: BufferLike) {
  if (!this.jose) {
    logger.debug('Sending: jose not initialized', data)
    this.send(data)
    return
  }

  logger.debug('Signing payload: ', { payload: data, jose: this.jose })

  const jws = await sign(this.jose.key, {
    payload: JSON.parse(data.toString()),
  })

  logger.debug('Sending', jws)

  this.send(jws)
}
