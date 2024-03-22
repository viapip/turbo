import { QueueEvents } from 'bullmq'

export const queueEvents = new QueueEvents('appQueue', {
  connection: {
    host: 'redis',
    port: 6379,
  },
})

// queueEvents.on('completed', async (ctx) => {
//   const job = await Job.fromId(bullmq, ctx.jobId)
//   job?.updateData((data: any) => ({ ...data, status: 'completed' }))
//   consola.info(`queue completed: ${JSON.stringify(job)}`)
// })
