import { IJoseData } from "@/jose/types"
import { WebSocket as WebSocketNode } from "ws";
import { wrapSocket } from "./ws"


const WebSocketBrowser = globalThis.WebSocket ? WebSocket : WebSocketNode


export class WebSocketBrowserProxy extends WebSocketBrowser {
  jose?: IJoseData;
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    jose?: IJoseData
  ) {
    super(address, protocols)
    this.jose = jose

    return wrapSocket(this)
  }
}
