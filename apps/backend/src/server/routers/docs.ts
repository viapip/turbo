import { a } from '@sozdev/share-libs'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'

// import consola from 'consola'

import { publicProcedure, rootRouter } from '../trpc'

import type { DocType } from '@sozdev/share-libs'
import type * as Y from 'yjs'

// const logger = consola.withTag('server')

export const docsRouter = rootRouter({
  getKeys: publicProcedure
    .query(async () => Array.from(a.docMap.keys())),

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

      a.change(id, doc)

      // console.log('microdiff', diff(prev, doc))
      return a.getDoc(id)
    }),

  deleteItem: publicProcedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      a.docMap.delete(id)

      return true
    }),

  onChange: publicProcedure
    .subscription(async () => observable<{ arg0: Y.YMapEvent<DocType>, arg1: Y.Transaction }>((emit) => {
      a.onChange((arg0, arg1) => {
        // const doc = A.init()
        // const changes = A.applyChanges(doc, [change.lastChange])[0]
        // logger.info('onChange', changes)
        // logger.success('onChange', change)
        emit.next({ arg0, arg1 })
      })
    })),
})

export type DocsRouter = typeof docsRouter
