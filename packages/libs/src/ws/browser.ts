import { IJoseVerify } from "@/jose/types"
// import { WebSocket as WebSocketNode } from "ws";
import { wrapSocket } from "./ws"

const WebSocketBrowser = globalThis.WebSocket ? WebSocket : class {}

export class WebSocketBrowserProxy extends WebSocketBrowser {
  jose?: IJoseVerify;
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    jose?: IJoseVerify
  ) {
    super(address, protocols)
    this.jose = jose

    return wrapSocket(this)
  }
}
