// import * as A from '@automerge/automerge'
import { EventEmitter } from 'node:events'

import { next as A } from '@automerge/automerge'
import consola from 'consola'

import type { ContainerID, LoroEvent } from 'loro-crdt'

export interface DocType {
  name: string
  ideas: Array<string>
}
// const test = A.init<DocType>()

const logger = consola.withTag('automerge')
// const rootDoc = new Loro<{ docs: LoroMap<Record<string, Loro>> }>()
export const docs: Map<string, A.Doc<DocType>> = new Map()

const emitter = new EventEmitter()
const doc = A.init<DocType>()
// const folder = rootDoc.getMap('docs')
// folder.set('docs', doc1)
// export const docMap = doc1.getMap('docs')
// doc1.setPeerId('1')
// export const docArray = doc1.getList('docs')

let n = 0
export function next() {
  n += 1

  return n
}
export function getDoc(id: string) {
  const obj = docs.get(id)
  if (!obj)
    docs.set(id, A.init())

  // let index = -1
  // docArray.forEach((doc, i) => {
  //   if (doc.id === id)
  //     index = i
  // })
  // if (index === -1)
  //   docArray.insert(docArray.length, [{ id, ideas: [], name: '' }])

  const data = A.save(doc)

  return data
}
export function change(
  id: string,
  changeFn: (d: DocType) => void,
  // changeFn: (d: DocType) => void,
) {
  if (!docs.has(id))
    docs.set(id, A.init<DocType>())

  let doc = docs.get(id)!
  logger.log('doc', doc)

  doc = A.change(A.clone(doc), {
    message: `Change ${next()}`,
    time: new Date().getTime(),
  }, changeFn)
  const lastChange = A.getLastLocalChange(doc)

  emitter.emit('change', { id, lastChange })
  docs.set(id, doc)
  // let index = -1
  // docArray.forEach((doc, i) => {
  //   if (doc.id === id)
  //     index = i
  // })
  // if (index > -1) {
  //   const doc = docArray.get(index)
  //   doc.ideas = d.ideas
  //   doc.name = d.name
  //   docArray.insert(index, [doc])
  // }
  // else {
  //   docArray.insert(docArray.length, [{ id, ...d }])
  // }

  return doc
}
export interface LoroEventBatch {
  /**
   * How the event is triggered.
   *
   * - `local`: The event is triggered by a local transaction.
   * - `import`: The event is triggered by an import operation.
   * - `checkout`: The event is triggered by a checkout operation.
   */
  by: 'local' | 'import' | 'checkout'
  origin?: string
  /**
   * The container ID of the current event receiver.
   * It's undefined if the subscriber is on the root document.
   */
  currentTarget?: ContainerID
  events: LoroEvent[]
}
// export interface Listener {
//   (event: LoroEventBatch, partitial: string): void
// }
export interface Listener {
  (data: { lastChange: A.Change, id: string }): void
}
export function onChange(
  listener: Listener,
) {
  logger.log('onChange')
  emitter.on('change', listener)
  // docMap.subscribe(doc1, listener)
  // let lastVV = doc1.version()
  // doc1.subscribe((event) => {
  //   // %DebugTrackRetainingPath(doc1)
  //   const newVV = doc1.version()
  //   logger.log('lastVV', lastVV)
  //   logger.log('newVV', newVV)
  //   doc1.debugHistory()
  //   listener(event, uint8ArrayToString(doc1.exportFrom(lastVV)))
  //   lastVV = newVV
  // })
  // docArray.observe((yarrayEvent) => {
  //   logger.log('yarrayEvent.changes.keys', JSON.stringify(yarrayEvent.changes))
  //   yarrayEvent.changes.keys.forEach((change, key) => {
  //     if (change.action === 'add')
  //       logger.log(`Property array "${key}" was added. Initial value: "${JSON.stringify(docMap.get(key))}".`)
  //     else if (change.action === 'update')
  //       logger.log(`Property array "${key}" was updated. New value: "${JSON.stringify(docMap.get(key))}". Previous value: "${JSON.stringify(change.oldValue)}".`)
  //     else if (change.action === 'delete')
  //       logger.log(`Property array "${key}" was deleted. New value: undefined. Previous value: "${JSON.stringify(change.oldValue)}".`)
  //   })
  // })
  // docMap.observe((ymapEvent) => {
  //   ymapEvent.changes.keys.forEach((change, key) => {
  //     if (change.action === 'add')
  //       logger.log(`Property "${key}" was added. Initial value: "${JSON.stringify(docMap.get(key))}".`)
  //     else if (change.action === 'update')
  //       logger.log(`Property "${key}" was updated. New value: "${JSON.stringify(docMap.get(key))}". Previous value: "${JSON.stringify(change.oldValue)}".`)
  //     else if (change.action === 'delete')
  //       logger.log(`Property "${key}" was deleted. New value: undefined. Previous value: "${JSON.stringify(change.oldValue)}".`)
  //   })
  // })
}

// doc.on('update', (update, origin, doc, transaction) => {
//   logger.log('update doc')

//   // logger.info('update', update)
//   // logger.info('origin', origin)
//   // logger.info('doc', doc)
//   // logger.info('transaction', transaction)
// })
// rootDoc.on('updateV2', () => {
//   logger.log('updateV2 rootDoc')
// })
// rootDoc.on('update', () => {
//   logger.log('update rootDoc')
// })
