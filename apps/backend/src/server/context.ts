import { createRedisStore, createAjv, bullmq, createMongoDBStore } from '@sozdev/share-libs'

import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'

export type Context = Awaited<ReturnType<typeof createContext>>
export type CreateContextOptions =
  | CreateHTTPContextOptions
  | CreateWSSContextFnOptions

const ajv = await createAjv()
const mongodb = await createMongoDBStore()
const redis = await createRedisStore()

export async function createContext(
  _opts: CreateContextOptions,
) {
  return {
    ajv,
    redis,
    bullmq,
    mongodb,
  }
}
