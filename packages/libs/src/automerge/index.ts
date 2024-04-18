import consola from 'consola'
import * as Y from 'yjs'

// import {Loro} from 'loro-crdt'
export interface DocType {
  name: string
  ideas: Array<string>
}
const logger = consola.withTag('automerge')
const rootDoc = new Y.Doc({ autoLoad: true })
export const doc1 = new Y.Doc({ autoLoad: true })
const folder = rootDoc.getMap()
folder.set('document.txt', doc1)
const doc = folder.get('document.txt') as Y.Doc
export const docMap = doc.getMap<DocType>('docs')
export const docArray = doc.getArray<DocType & { id: string }>('docsArray')

let n = 0
export function next() {
  n += 1

  return n
}

export function getDoc(id: string) {
  if (!docMap.has(id))
    docMap.set(id, { name: '', ideas: [] })

  let index = -1
  docArray.forEach((doc, i) => {
    if (doc.id === id)
      index = i
  })
  if (index === -1)
    docArray.insert(docArray.length, [{ id, ideas: [], name: '' }])

  const doc = docMap.get(id)!

  return doc
}

export function change(
  id: string,
  d: DocType,
  // changeFn: (d: DocType) => void,
) {
  logger.log('merge change')
  docMap.set(id, d)
  let index = -1
  docArray.forEach((doc, i) => {
    if (doc.id === id)
      index = i
  })
  if (index > -1) {
    const doc = docArray.get(index)
    doc.ideas = d.ideas
    doc.name = d.name
    docArray.insert(index, [doc])
  }
  else {
    docArray.insert(docArray.length, [{ id, ...d }])
  }

  return d
}

export function onChange(
  listener: (arg0: Y.YMapEvent<DocType>, arg1: Y.Transaction) => void,
) {
  logger.log('onChange')
  docMap.observe(listener)
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

doc.on('update', (update, origin, doc, transaction) => {
  logger.log('update doc')

  // logger.info('update', update)
  // logger.info('origin', origin)
  // logger.info('doc', doc)
  // logger.info('transaction', transaction)
})
rootDoc.on('updateV2', () => {
  logger.log('updateV2 rootDoc')
})
rootDoc.on('update', () => {
  logger.log('update rootDoc')
})
