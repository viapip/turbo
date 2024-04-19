import consola from 'consola'
import { Loro } from 'loro-crdt'

import { uint8ArrayToString } from '../transformer'

import type { ContainerID, LoroEvent, LoroMap } from 'loro-crdt'

export interface DocType {
  name: string
  ideas: Array<string>
}
const logger = consola.withTag('automerge')
const rootDoc = new Loro<{ docs: LoroMap<Record<string, Loro>> }>()
export const doc1 = new Loro<{ docs: LoroMap<Record<string, DocType>> }>()
const folder = rootDoc.getMap('docs')
folder.set('docs', doc1)
export const docMap = doc1.getMap('docs')
// export const docArray = doc1.getList('docs')

let n = 0
export function next() {
  n += 1

  return n
}

export function getDoc(id: string) {
  const obj = docMap.get(id)
  if (!obj)
    docMap.set(id, { name: '', ideas: [] })

  // let index = -1
  // docArray.forEach((doc, i) => {
  //   if (doc.id === id)
  //     index = i
  // })
  // if (index === -1)
  //   docArray.insert(docArray.length, [{ id, ideas: [], name: '' }])

  const data = doc1.exportSnapshot()

  return uint8ArrayToString(data)
}

export function change(
  id: string,
  d: DocType,
  // changeFn: (d: DocType) => void,
) {
  logger.log('merge change')
  docMap.set(id, d)
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

  return d
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
export interface Listener {
  (event: LoroEventBatch, snapshot: string): void
}
export function onChange(
  listener: Listener,
) {
  logger.log('onChange')
  // docMap.subscribe(doc1, listener)
  doc1.subscribe((event) => {
    const snapshot = doc1.exportSnapshot()
    listener(event, uint8ArrayToString(snapshot))
  })
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
