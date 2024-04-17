import { EventEmitter } from 'node:events'

import diff from 'microdiff'

import type { Difference } from 'microdiff'

// import { next as A } from '@automerge/automerge'

// import consola from 'consola'

export interface DocType {
  name: string
  ideas: Array<string>
}

// const logger = consola.withTag('automerge')
export const docs: Map<string, DocType> = new Map()
const emitter = new EventEmitter()

let n = 0
export function next() {
  n += 1

  return n
}

export function getDoc(id: string) {
  if (!docs.has(id)) {
    docs.set(id, { name: '', ideas: [] })
  }
  const doc = docs.get(id)!

  return doc
}

export function change(
  id: string,
  d: DocType,
  // changeFn: (d: DocType) => void,
) {
  let doc
  if (!docs.has(id)) {
    doc = { name: '', ideas: [] }
    docs.set(id, doc)
  }
  doc = docs.get(id)!

  const diffs = diff(doc, d)

  emitter.emit('change', { id, diffs })
  // doc = A.change(doc, {
  //   message: `Change ${next()}`,
  //   time: new Date().getTime(),
  // }, changeFn)
  // const lastChange = A.getLastLocalChange(doc)

  docs.set(id, d)

  return doc
}

export function onChange(
  listener: (data: { id: string, diffs: Difference[] }) => void,
) {
  emitter.on('change', listener)
}
