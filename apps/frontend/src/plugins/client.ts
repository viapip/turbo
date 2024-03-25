import { type IJoseVerify, type KeyPair, WebSocketBrowserProxy, transformer } from '@sozdev/share-libs/dist/browser'
import { type CreateTRPCProxyClient, createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client'
import consola from 'consola'
import { createLocalJWKSet } from 'jose'

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
    WebSocket: WebSocketBrowserProxy as any,

    onOpen() {
      consola.info('Connected')
    },
    onClose() {
      consola.info('Disconnected')
    },
  })
  const ws = wsClient.getConnection() as WebSocketBrowserProxy

  ws.jose = await getJoseVerify()

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

async function getJoseVerify(): Promise<IJoseVerify> {
  const keys1 = {
    publicKey: {
      kty: 'EC',
      x: 'C4NS5Hxxqh5-_NDTJ_0fRTINJIf7ud32HlfCwYUNerQ',
      y: 'aVPGrtD5j60SfDPR26fUX-ffXaW91-3bEpxB41XBJZA',
      crv: 'P-256',
      kid: 'key1',
    },
    privateKey: {
      kty: 'EC',
      x: 'C4NS5Hxxqh5-_NDTJ_0fRTINJIf7ud32HlfCwYUNerQ',
      y: 'aVPGrtD5j60SfDPR26fUX-ffXaW91-3bEpxB41XBJZA',
      crv: 'P-256',
      d: 'TntgBuB2BhlC8WT5WZWPUf7TSgIugvJwwYwpFx5K7Ms',
      kid: 'key1',
    },
  } as KeyPair

  const keys2 = {
    publicKey: {
      kty: 'EC',
      x: 'Ngdlc4RyOOLIrlkf7GmB-7UqLuOsoWd8R1rxVy_2kVY',
      y: 'eW7NQ1oo3RjMbJW3gYLD8qEPWkQ-DEXBYIp-gP8kwlI',
      crv: 'P-256',
      kid: 'key2',
    },
    privateKey: {
      kty: 'EC',
      x: 'Ngdlc4RyOOLIrlkf7GmB-7UqLuOsoWd8R1rxVy_2kVY',
      y: 'eW7NQ1oo3RjMbJW3gYLD8qEPWkQ-DEXBYIp-gP8kwlI',
      crv: 'P-256',
      d: 'XaD6RzpyryC2azMe-lklZVl71SkHGRt9BK6tY_qJnM8',
      kid: 'key2',
    },
  } as KeyPair

  //  const keys1Private = await importJWK(keys1.privateKey)
  //  const keys2Private = await importJWK(keys2.privateKey)

  const jwks = createLocalJWKSet({
    keys: [
      keys1.publicKey,
      keys2.publicKey,
    ],
  })

  return {
    jwks,
    key: keys1,
  }
}
