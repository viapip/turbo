// import consola from 'consola'
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

import consola from 'consola'
import glob from 'fast-glob'

import { redis } from '@/redis'

import type { AnySchemaObject } from 'ajv'

const defsFiles = await glob('*.json', {
  cwd: 'defs',
  absolute: true,
})

const schemaFiles = await glob('*.json', {
  cwd: 'schema',
  absolute: true,
})

const defs = await getSchemas(defsFiles, '')
const schemas = await getSchemas(schemaFiles, '')

await Promise.all([...schemas, ...defs].map(async schema => redis.schemas.insertOne(schema.$id, schema)))

consola.success('Done!')

await redis.disconnect()

async function getSchemas(inputFiles: string[], id: string) {
  return await Promise.all(inputFiles.map(async (file) => {
    const fileContent = await readFile(file, 'utf8')
    const schemaId = basename(file, '.json')
    const schema = JSON.parse(fileContent) as AnySchemaObject

    return { ...schema, $id: id + schemaId }
  }))
}
