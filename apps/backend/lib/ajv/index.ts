import { TRPCError } from '@trpc/server'
import Ajv from 'ajv'
import ajvErrors from 'ajv-errors'
import ajvFormats from 'ajv-formats'
import ajvI18n from 'ajv-i18n'
import ajvKeywords from 'ajv-keywords'
import consola from 'consola'
import glob from 'fast-glob'
import {userSchema } from './schema'
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { redis } from '@/redis'

import type { AnySchemaObject } from 'ajv'

const logger = consola.withTag('ajv')

export async function createAjv() {
  const ajv = new Ajv({
    logger,
    schemaId: '$id',
    meta: true,
    strict: 'log',
    strictTypes: 'log',
    allErrors: true,
    messages: false,
    verbose: true,
    coerceTypes: true,
    addUsedSchema: true,
    validateFormats: true,
    inlineRefs: true,
    passContext: true,
    timestamp: 'date',
    $data: true,
    // loadSchema: async (uri: string) => {
    //   const transformedUri = uri.replace('/', ':')
    //   logger.info('Requesting schema', uri, '->', transformedUri)
    //   const schema = await redis.schemas.findOne(transformedUri) as AnySchemaObject | undefined

    //   if (!schema) {
    //     throw new TRPCError({
    //       code: 'BAD_REQUEST',
    //       message: `Schema not found: ${uri}`,
    //     })
    //   }

    //   return schema
    // },
  })

  ajvKeywords(ajv)
  ajvFormats(ajv)
  ajvErrors(ajv)
  // const schemas = await redis.schemas.getAll()

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

  // logger.info('Loaded schemas', schemas.length)
  ajv.addSchema(schemas)
  ajv.addSchema(userSchema, 'User')
  // ajv.compileAsync(userSchema)
  function validateSchema(schemaId: string, data: unknown) {
    const valid = ajv.validate(schemaId, data)

    consola.success('Validating schema', schemaId, valid)
    if (!valid) {
      ajvI18n.ru(ajv.errors)

      throw new TRPCError({
        cause: ajv.errors,
        code: 'BAD_REQUEST',
        message: ajv.errorsText(ajv.errors, {
          separator: '\n',
          dataVar: 'data',
        }),
      })
    }
  }

  return {
    addSchema: ajv.addSchema,
    getSchema: (id: string) => ajv.getSchema(id),
    validateSchema,
  }
}
