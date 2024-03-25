import { IJoseVerify } from "../jose/types"
import { wrapSocket } from "./wrapper"

const WebSocketBrowser = globalThis.WebSocket ? WebSocket : class {}

export class WebSocketBrowserProxy extends WebSocketBrowser {
  jose?: IJoseVerify;
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    jose?: IJoseVerify
  ) {
    super(address, protocols)
    return wrapSocket(this, jose)
  }
}
