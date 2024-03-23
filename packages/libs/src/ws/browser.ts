import { IJoseData } from "@/jose/types"
import { wrapSocket } from "./ws"


export class WebSocketBrowserProxy extends WebSocket {
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
