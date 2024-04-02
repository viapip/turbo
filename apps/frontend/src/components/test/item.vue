<script setup lang="ts">
const props = withDefaults(defineProps<{
  item: any
  index: number
}>(), {})
</script>

<template>
  <div class="w-full flex p-3">
    {{ props.item }}
    <!-- <div class="mr-5">{{ props.item.info.name }}</div>
    <div class="mr-5">{{ props.item.info.email }}</div>
     <UBadge>{{ props.item.status }}</UBadge> -->
    <!-- <UBadge>{{ props.item }}</UBadge> -->
  </div>
</template>
