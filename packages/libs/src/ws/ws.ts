import { WebSocket as WebSocketNode } from 'ws'

import { wrapSocket } from './wrapper'

import type { IJoseVerify } from '../jose/types'
import type { ClientOptions } from 'ws'

export class WebSocketProxy extends WebSocketNode {
  public jose?: IJoseVerify
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    options?: ClientOptions,
    jose?: IJoseVerify,
  ) {
    super(address, protocols, options)
    return wrapSocket(this, jose)
  }
}
