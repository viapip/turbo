<script setup lang="ts">
import { defineProps } from 'vue'

interface FieldProps {
  name: string
  required?: boolean
  disabled?: boolean
}

const _props = defineProps<FieldProps>()
const emits = defineEmits(['change', 'blur', 'focus'])

// Events
function _onChange(id: string, value: string) {
  emits('change', id, value)
}
function _onBlur(id: string, value: string) {
  emits('blur', id, value)
}
function _onFocus(_event: FocusEvent) {
}
</script>

<template>
  <div>objectField</div>
</template>
