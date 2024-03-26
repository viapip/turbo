import {WebSocket as WebSocketNode} from 'ws'
import type { ClientOptions } from 'ws'
import { IJoseVerify } from '../jose/types'
import { wrapSocket } from './wrapper'


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

