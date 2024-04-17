<script setup lang="ts">
import { clone, set } from 'radash'

import type { DocType } from '@sozdev/share-libs/src/browser'
import type { Difference } from 'microdiff'

const { $trpc } = useNuxtApp()
const items = ref([
  {
    changes: [],
    slot: 'test',
  },
])
const doc = ref<DocType>({ name: '', ideas: [] })
doc.value = await $trpc.docs.getItem.query('123')
// wrap.doc = A.load<DocType>(stringToUint8Array(resDoc))

$trpc.docs.onChange.subscribe(undefined, {
  onData(value) {
    // const decoded = A.decodeChange(value.lastChange)
    // console.log(decoded)
    // console.log(A.getAllChanges(wrap.doc))
    doc.value = applyDiffs(clone(doc.value), value.diffs)
    // const heads = A.getHeads(wrap.doc)
    // const before = A.getHeads(wrap.doc)

    // items.value[0].changes.push(value.lastChange)
    // const change = A.applyChanges(wrap.doc, [value.lastChange])
    // wrap.doc = change[0]
    // const diff = A.diff(wrap.doc, before, A.getHeads(wrap.doc))
    // A
    //   .console.log('diff', diff)
  },
})

const keys = await $trpc.docs.getKeys.query()

function formatPath(path: (string | number)[]) {
  let text = ''
  for (const p of path) {
    switch (typeof p) {
      case 'string':
        text += p
        break
      case 'number':
        text += `[${p}]`
        break
    }
    text += `.`
  }
  // console.log('formatPath:', text.slice(0, -1))

  return text.slice(0, -1)
}
function applyDiffs(doc: DocType, diffs: Difference[]) {
  for (const diff of diffs) {
    const path = formatPath(diff.path)
    switch (diff.type) {
      case 'CHANGE':
      case 'CREATE':
        doc = set(doc, path, diff.value)
        break
      case 'REMOVE':
        doc = set(doc, path, undefined)
        break
    }
  }

  return doc
}
</script>

<template>
  <div>
    <div> merge component</div>
    <div> keys:{{ keys }}</div>
    <div>doc: {{ doc }}</div>
    <UInput v-model="doc.name" />
    <UAccordion :items="items">
      <template #default>
        <UButton> изменения</UButton>
      </template>
      <template #test="{ item }">
        <div>
          <div v-for="i in item.changes" :key="i.hash">
            {{ i }}
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>
