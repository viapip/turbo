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
  // const keys1 = {
  //   "publicKey": {
  //     "kty": "EC",
  //     "x": "D8qVLV7UckTvFFMB2dRumgO1hb-VctMkcdCfLWLaFvQ",
  //     "y": "pKHQOfL0K8W6FZipThjF9XYuXrciOQeQE4ei55vSXes",
  //     "crv": "P-256",
  //     "kid": "key1"
  //   },
  //   "privateKey": {
  //     "kty": "EC",
  //     "x": "D8qVLV7UckTvFFMB2dRumgO1hb-VctMkcdCfLWLaFvQ",
  //     "y": "pKHQOfL0K8W6FZipThjF9XYuXrciOQeQE4ei55vSXes",
  //     "crv": "P-256",
  //     "d": "CGUOSodDIy0tqTpgDxH0j4ReoMA9tzeMXUVmZ61G0Y0",
  //     "kid": "key1"
  //   }
  // } as KeyPair

  const keys2 = {
    publicKey: {
      kty: 'EC',
      x: '8a8o_RUGD1_piE5ouA9ZyHI-4FHIZEZgTO6bW5MORYQ',
      y: 'EVyoFgTSSyymg1pAStH42OpQezzOMM12kVCS6KHpm-I',
      crv: 'P-256',
      kid: 'key2',
    },
    privateKey: {
      kty: 'EC',
      x: '8a8o_RUGD1_piE5ouA9ZyHI-4FHIZEZgTO6bW5MORYQ',
      y: 'EVyoFgTSSyymg1pAStH42OpQezzOMM12kVCS6KHpm-I',
      crv: 'P-256',
      d: 'KUiphkKbdmzYT_wnn0LFdfGXI0EFgRTV2sZEI1XRH8g',
      kid: 'key2',
    },
  } as KeyPair

  // const publicKey = await importJWK(keys2.publicKey, 'ES256')

  const jwks = createLocalJWKSet({
    keys: [keys2.publicKey],
  })

  // console.log('test', publicKey);

  return {
    jwks,
    key: keys2,
  }
}
