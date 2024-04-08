<script setup lang="ts">
import { resolveComponent } from 'vue'

import type { JSONSchema7, JSONSchema7TypeName } from 'json-schema'

const props = withDefaults(defineProps<{
  schema: JSONSchema7
}>(), {})

const defaultMapFields: Record<JSONSchema7TypeName, string> = {
  string: 'EditorFieldsString',
  number: 'EditorFieldsNumber',
  integer: 'EditorFieldsNumber',
  boolean: 'EditorFieldsBoolean',
  object: 'EditorFieldsObject',
  array: 'EditorFieldsArray',
  null: 'EditorFieldsNull',
} as const

const withSpecialChilds = ['properties', 'definitions', 'required']

const computedMap = computed(() => {
  const map = new Map<string, Omit<JSONSchema7, 'type'> & { type: JSONSchema7TypeName }>()
  traverse(props.schema, (
    s: { type: JSONSchema7TypeName },
    key?: string,
  ) => {
    if (key && !withSpecialChilds.includes(key))
      map.set(key, { $id: key, ...s })
    if (s.type === 'array')
      return undefined
  })

  return map
})

provide('schema', props.schema)
</script>

<template>
  <div>
    <div class="border py-8">
      {{ computedMap }}
    </div>

    <div>
      <div v-for="[key, value] of computedMap.entries()" :key="key">
        <component
          :is="resolveComponent(defaultMapFields[value.type])"
          :schema="props.schema"
          :item="value"
        />
      </div>
    </div>
  </div>
</template>
