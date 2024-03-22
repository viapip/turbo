import { IJoseData } from "@/jose/types";

declare module 'ws' {
  export interface WebSocketServer {
    jose?: IJoseData
  }
  export interface WebSocket {
    jose?: IJoseData
  }
}
