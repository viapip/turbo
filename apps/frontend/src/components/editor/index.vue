<script setup lang="ts">
import type { JSONSchema7 } from 'json-schema'

const schema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    status: {
      type: 'string',
    },
    date: {
      type: 'string',
      format: 'date-time',
    },
    option: {
      type: 'number',
    },
    info: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
        },
        age: {
          type: 'number',
        },
      },
    },
  },
  required: ['status'],
  additionalProperties: false,
}

// const parser = schemaParser(schema)

// const retrieve = retrieveSchema(validator, schema)

// console.log('schema', { parser, retrieve })
</script>

<template>
  <div class="flex mt-10 flex-col items-start">
    <div class="text-3xl font-bold">
      Editor
    </div>
    <EditorForm :schema="schema" />
  </div>
</template>
