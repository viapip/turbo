import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import consola from 'consola'
import { readFile } from 'node:fs/promises'
import { WebSocketServerProxy } from '@/ws'

import { createContext } from './context'
import { router } from './router'

import type { AppRouter } from './router'
import { createLocalJWKSet } from 'jose'

import { IJoseData, KeyPair } from '@sozdev/share-libs'

const logger = consola.withTag('server')

export const app = createHTTPServer({
  router,
  createContext,
  batching: { enabled: true },

  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      logger.error(error)
    }
  },
})

const jose = await getJoseData()

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
async function getJoseData(): Promise<IJoseData> {

 const keys1: KeyPair = JSON.parse(await readFile(
  'keys/key1.jwk',
  'utf8',
))
 const keys2: KeyPair = JSON.parse(await readFile(
  'keys/key2.jwk',
  'utf8',
))

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
  key: keys2,
}

}

app.listen(8080)
