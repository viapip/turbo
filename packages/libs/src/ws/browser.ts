import consola from 'consola'
import { IJoseVerify } from '../jose/types'

import { sign, verify } from '../jose/sign'

export class WebSocketBrowserProxy extends WebSocket {
  jose?: IJoseVerify
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    jose?: IJoseVerify,
  ) {
    super(address, protocols)
    return wrapSocket(this, jose)
  }
}

export function wrapSocket<T>(
  ws: WebSocketBrowserProxy,
  jose?: IJoseVerify,
) {
  ws.jose = jose
  return new Proxy(ws, {
    get: (target, prop) => {
      logger.log('Getting', prop, target)
      switch (prop) {
        case 'addEventListener':
            return customOn.bind(target)
        case 'send':
          return customSend.bind(target)
      }

      return Reflect.get(target, prop)
    },
  }) as T
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


      logger.info('event', event)
      if (!this.jose) {
        return listener.call(this, event)
      }

      const { payload, ...jws } = await verify(data.toString(), this.jose.jwks)
      const newEvent = new MessageEvent('message', {
        data: JSON.stringify(payload),
        origin: event.origin,
        source: event.source,
        lastEventId: event.lastEventId,
        ports: [
          ...event.ports
        ],
      })
      logger.info('payload', payload)
      logger.info('newEvent', newEvent)
      listener.call(this, newEvent)

      return
    }

    logger.log('Receiving', event, args)

    listener.call(this, ...args)
  }
}

async function customSend(
  this: WebSocketBrowserProxy,
  data: BufferLike
) {
  console.log('customSend', data)

  if (!this.jose) {
    this.send(data)
    return
  }

  logger.info('before send:data', data)
  logger.info('before send:jose', this.jose)

  const jws = await sign(this.jose.key, {
    payload: JSON.parse(data.toString()),
  })

  logger.log('Sending', jws)

  this.send(jws)
}
