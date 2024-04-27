import { a } from '@sozdev/share-libs'
import { observable } from '@trpc/server/observable'
import consola from 'consola'
import { z } from 'zod'

import { publicProcedure, rootRouter } from '../trpc'

import type { next as A } from '@automerge/automerge'

const logger = consola.withTag('server')

export const docsRouter = rootRouter({
  getKeys: publicProcedure
    .query(async () => Array.from(a.docs.keys())),

  getItem: publicProcedure
    .input(z.string())
    .query(async ({ input: id }) => a.getDoc(id)),

  putItem: publicProcedure
    .input(z.object({
      id: z.string(),
      doc: z.object({
        name: z.string(),
        ideas: z.array(z.any()),
      }),
    }))
    .mutation(async ({ input: { id, doc } }) => {
      // const prev = a.docs.get(id)!

      a.change(id, (d) => {
        d.ideas = doc.ideas
        d.name = doc.name
      })

      // console.log('microdiff', diff(prev, doc))
      return a.getDoc(id)
    }),

  deleteItem: publicProcedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      a.docs.delete(id)

      return true
    }),

  onChange: publicProcedure
    .subscription(async () => observable<{ lastChange: A.Change, id: string }>((emit) => {
      a.onChange((data) => {
        logger.info('onChange', data.id)
        // const doc = A.init()
        // const changes = A.applyChanges(doc, [change.lastChange])[0]
        // logger.info('onChange', changes)
        // logger.success('onChange', change)
        emit.next(data)
      })
    })),
})

export type DocsRouter = typeof docsRouter
