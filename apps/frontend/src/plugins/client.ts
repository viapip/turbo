import { type CreateTRPCProxyClient, createTRPCProxyClient, createWSClient, httpBatchLink, wsLink } from '@trpc/client'
import consola from 'consola'
import json from 'superjson'
import { WebSocketProxy } from '~/utils/ws/index'

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
    WebSocket: WebSocket,

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
    transformer: json,
  })
  nuxtApp.provide('trpc', client)
})
