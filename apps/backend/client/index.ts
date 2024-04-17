import { readFile } from 'node:fs/promises'
import process from 'node:process'

import { WebSocketProxy, transformer } from '@sozdev/share-libs'
import {
  createTRPCProxyClient,
  createWSClient,
  wsLink,
} from '@trpc/client'
import consola from 'consola'
import { createLocalJWKSet } from 'jose'

import type { AppRouter } from '~/server/router'

import type { IJoseVerify, KeyPair } from '@sozdev/share-libs'

const logger = consola.withTag('client')

const wsClient = createWSClient({
  url: 'ws://localhost:8080',
  WebSocket: WebSocketProxy as any,

  onOpen() {
    logger.info('Connected')
  },
  onClose() {
    logger.info('Disconnected')
  },
})

const ws = wsClient.getConnection()

ws.jose = await getJoseVerify()
// ws.jose = {
//   jwks,
//   key: keys1
// }

const client = createTRPCProxyClient<AppRouter>({
  links: [wsLink({ client: wsClient })],
  transformer,
})

const n = Number.parseInt(process.argv[2], 10) || 1
// const users = await client.data.getAll.query()
// let doc = A.init<DocType>()

// const resDoc = await client.docs.getItem.query('123')
// const doc = A.load<DocType>(stringToUint8Array(resDoc))
// doc = A.merge(doc, docQ)

setInterval(() => {
  const random = Math.floor(Math.random() * 1000)
  console.log('random', random)

  // doc = A.change(A.clone(doc), (doc) => {
  //   doc.name = `hello world 1 - ${random}`
  // })
  // console.log('docSetTimeout', doc)
  const ideas = Array.from(({ length: 10000 })).map(() => ({ text: { text: `idea ${Math.floor(Math.random() * 1000)}`, 8: Math.floor(Math.random() * 1000) } }))
  client.docs.putItem.mutate({ id: '123', doc: { name: `hello world 1 - ${random}`, ideas } })
}, 500)

// logger.info('Users:', users.length)
const subscription = client.docs.onChange.subscribe(undefined, {
  onStarted() {
    logger.info('Subscription started')
  },
  onData(value) {
    // const change = A.applyChanges(doc, [value.lastChange])
    // doc = change[0]
    // logger.success('Subscription data', change[0])
  },
  onError(err) {
    logger.error('Subscription error', err)
  },
  onComplete() {
    logger.info('Subscription ended')
  },
})

while (true) {
  // await Promise.all(
  //   users.map(async ({ id }) => {
  //     const user = await client.data.getItem.query(id)
  //     logger.info('User name:', user?.name, user?.id)
  //   }),
  // )

  const name = await logger
    .prompt('Enter user name: ', {
      type: 'text',
      required: true,
    })

  if (typeof name !== 'string') {
    logger.info('Invalid name')
    // subscription.unsubscribe()
    break
  }

  const { _id } = await client.data.postItem.mutate({
    id: `${Math.floor(Math.random() * 1000)}`,
    schemaId: 'User',
    data: {
      status: 'active',
      date: new Date(),
      info: {
        name,
        email: `${name}@example.com`,
      },
    },
  }) as { _id: string }

  const user = await client.data.getItem.query(_id)
  if (user) {
    users.push(user)
    logger.info('User', user)
  }
}

process.exit(0)
async function getJoseVerify(): Promise<IJoseVerify> {
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
