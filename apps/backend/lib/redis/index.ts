import { createClient } from 'redis'

export const redis = await createRedisStore()

export async function createRedisStore() {
  const connection = createClient({ url: 'redis://redis:6379' })
  await connection.connect()

  function createCRUD<T = unknown>(prefix = '') {
    const formatPattern = (...args: string[]) => [prefix, ...args].join(':')

    const keyExists = async (id: string) => {
      const pattern = formatPattern(id)
      const exists = await connection.exists(pattern)

      return exists === 1
    }

    const getKeys = async () => {
      const pattern = formatPattern('*')
      const keys = await connection.keys(pattern)

      return keys
    }

    const getAll = async () => {
      const userKeys = await getKeys()
      if (userKeys.length === 0) {
        return []
      }

      const items = await connection.json.mGet(userKeys, '$')

      return items.flat() as T[]
    }

    const insertOne = async (_id: string, data: T) => {
      const pattern = formatPattern(_id)
      const item = { ...data, _id }
      await connection.json.set(pattern, '$', item)

      return item as T
    }

    const findOne = async (id: string) => {
      const pattern = formatPattern(id)
      const item = await connection.json.get(pattern) as T
      if (!item) {
        return
      }

      return item as T
    }
    const findMany = async (...ids: string[]) => {
      const pattern = ids.map(id => formatPattern(id))
      const items = await connection.json.mGet(pattern, '$')

      return items as T[]
    }

    const deleteOne = async (id: string) => {
      const pattern = formatPattern(id)
      await connection.del(pattern)

      return true
    }
    const deleteMany = async (...ids: string[]) => {
      const pattern = ids.map(id => formatPattern(id))
      await connection.del(pattern)

      return true
    }

    return {
      keyExists,
      getKeys,

      getAll,

      insertOne,

      findOne,
      findMany,

      deleteOne,
      deleteMany,
    }
  }

  return { data: createCRUD('data'), schemas: createCRUD('schemas'), disconnect: () => connection.disconnect() }
}
