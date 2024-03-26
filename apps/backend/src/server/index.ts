import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import consola from 'consola'
import { readFile } from 'node:fs/promises'

import { createContext } from './context'
import { router } from './router'

import type { AppRouter } from './router'
import { createLocalJWKSet, importJWK } from 'jose'

import { jwks, keys1, keys2 } from '@/jose/keys'

import { IJoseVerify, KeyPair, WebSocketServerProxy } from '@sozdev/share-libs'

const logger = consola.withTag('server')

export * from './router'

export async function bootstrap() {
  const app = createHTTPServer({
    router,
    createContext,
    batching: { enabled: true },

    onError({ error }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        logger.error(error)
      }
    },
  })

  const jose = await getJoseVerify()
  // const jose = {
  //   jwks,
  //   key: keys2
  // }

  applyWSSHandler<AppRouter>({
    wss: new WebSocketServerProxy(app, jose),

    router,
    createContext,
    batching: { enabled: true },

    onError({ error }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        logger.error(error)
      }
    },
  })
  async function getJoseVerify(): Promise<IJoseVerify> {
    // const keys1: KeyPair = JSON.parse(await readFile('keys/key1.jwk', 'utf8'))
    // const keys2: KeyPair = JSON.parse(await readFile('keys/key2.jwk', 'utf8'))
    const keys1 = {
      "publicKey": {
        "kty": "EC",
        "x": "D8qVLV7UckTvFFMB2dRumgO1hb-VctMkcdCfLWLaFvQ",
        "y": "pKHQOfL0K8W6FZipThjF9XYuXrciOQeQE4ei55vSXes",
        "crv": "P-256",
        "kid": "key1"
      },
      "privateKey": {
        "kty": "EC",
        "x": "D8qVLV7UckTvFFMB2dRumgO1hb-VctMkcdCfLWLaFvQ",
        "y": "pKHQOfL0K8W6FZipThjF9XYuXrciOQeQE4ei55vSXes",
        "crv": "P-256",
        "d": "CGUOSodDIy0tqTpgDxH0j4ReoMA9tzeMXUVmZ61G0Y0",
        "kid": "key1"
      }
    } as KeyPair
  
    const keys2 = {
      "publicKey": {
        "kty": "EC",
        "x": "8a8o_RUGD1_piE5ouA9ZyHI-4FHIZEZgTO6bW5MORYQ",
        "y": "EVyoFgTSSyymg1pAStH42OpQezzOMM12kVCS6KHpm-I",
        "crv": "P-256",
        "kid": "key2"
      },
      "privateKey": {
        "kty": "EC",
        "x": "8a8o_RUGD1_piE5ouA9ZyHI-4FHIZEZgTO6bW5MORYQ",
        "y": "EVyoFgTSSyymg1pAStH42OpQezzOMM12kVCS6KHpm-I",
        "crv": "P-256",
        "d": "KUiphkKbdmzYT_wnn0LFdfGXI0EFgRTV2sZEI1XRH8g",
        "kid": "key2"
      }
    } as KeyPair
    //  const keys1Private = await importJWK(keys1.privateKey)
    //  const keys2Private = await importJWK(keys2.privateKey)

    const jwks = createLocalJWKSet({
      keys: [
        keys1.publicKey, 
        keys2.publicKey
      ],
    })

    const publicKey = await importJWK(keys2.publicKey, 'ES256')

    return {
      jwks: publicKey,
      key: keys2,
    }
  }

  app.listen(8080)
}

bootstrap()
