import { createRedisStore, createAjv, bullmq, createMongoDBStore } from '@sozdev/share-libs'
import { TRPCError } from '@trpc/server'

import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'
import { AnySchemaObject, Options } from 'ajv'
import consola from 'consola'

export type Context = Awaited<ReturnType<typeof createContext>>
export type CreateContextOptions =
  | CreateHTTPContextOptions
  | CreateWSSContextFnOptions

  const logger = consola.withTag('ajv/server')
  
  const redis = await createRedisStore()
  const mongodb = await createMongoDBStore()
  const options: Options = {
    logger,
    loadSchema: async (uri: string) => {
      const transformedUri = uri.replace('/', ':')
      logger.info('Requesting schema', uri, '->', transformedUri)
      const schema = await redis.schemas.findOne(transformedUri) as AnySchemaObject | undefined
  
      if (!schema) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Schema not found: ${uri}`,
        })
      }
      return schema
    },
  }

  const ajv = await createAjv(options)
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
