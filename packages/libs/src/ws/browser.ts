import { IJoseData } from "@/jose/types"
import { wrapSocket } from "./ws"


export class WebSocketProxy extends WebSocket {
  public constructor(
    address: string | URL,
    protocols?: string | string[],
    jose?: IJoseData
  ) {
    super(address, protocols)
    return wrapSocket(this, jose) as WebSocket
  }
}
