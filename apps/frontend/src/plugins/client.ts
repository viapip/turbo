import { WebSocketBrowserProxy, transformer } from '@sozdev/share-libs'
import { type CreateTRPCProxyClient, createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client'
import consola from 'consola'

import type { AppRouter } from '@sozdev/backend'

declare module '#app/nuxt' {
  export interface NuxtApp {
    $trpc: CreateTRPCProxyClient<AppRouter>
  }
}

export default defineNuxtPlugin(async (_nuxtApp) => {
  const nuxtApp = useNuxtApp()
  const wsClient = createWSClient({
    url: 'ws://localhost:8080',
    WebSocket: WebSocketBrowserProxy as typeof WebSocket,

    onOpen() {
      consola.info('Connected')
    },
    onClose() {
      consola.info('Disconnected')
    },
  })

  const client = createTRPCProxyClient<AppRouter>({
    links: [
      wsLink({
        client: wsClient,
      }),
    ],
    transformer,
  })
  nuxtApp.provide('trpc', client)
})
