import { dataRouter } from './routers/data'
import { docsRouter } from './routers/docs'
import { rootRouter } from './trpc'

// Merge routers together
export const router = rootRouter({
  data: dataRouter,
  docs: docsRouter,
})

export type AppRouter = typeof router
