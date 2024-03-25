import { createRedisStore, createAjv, bullmq, createMongoDBStore } from '@sozdev/share-libs'
import { TRPCError } from '@trpc/server'

import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'
import { AnySchema, AnySchemaObject, Options } from 'ajv'
import consola from 'consola'
import glob from 'fast-glob'
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

export type Context = Awaited<ReturnType<typeof createContext>>
export type CreateContextOptions =
  | CreateHTTPContextOptions
  | CreateWSSContextFnOptions

  const logger = consola.withTag('ajv/server')
  
  const redis = await createRedisStore()
  const mongodb = await createMongoDBStore()
  
  const files = await glob('*.json', {
    cwd: 'defs',
    absolute: true,
  })

  const schemas = await Promise.all(files.map(async (file) => {
    console.log('Loading schema', file)
    const fileContent = await readFile(file, 'utf8')
    const schemaId = basename(file, '.json')
    const schema = JSON.parse(fileContent) as AnySchemaObject

    return { ...schema, $id: schemaId }
  }))

  const options: Options = {
    logger,
    schemas,
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
