import {WebSocket as WebSocketNode} from 'ws'
import type { ClientOptions } from 'ws'
import { IJoseVerify } from '../jose/types'
import { wrapSocket } from './utils'

declare module 'ws' {
  export interface WebSocketServer {
    jose?: IJoseVerify
  }
  export interface WebSocket {
    jose?: IJoseVerify
  }
}

declare global {
  export interface WebSocket {
    jose?: IJoseVerify
  }
}

export class WebSocketProxy extends WebSocketNode {
  public jose?: IJoseVerify
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    options?: ClientOptions,
    jose?: IJoseVerify,
  ) {
    super(address, protocols, options)
    this.jose = jose
    return wrapSocket(this)
  }
}

