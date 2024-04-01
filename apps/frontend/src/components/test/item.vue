<script setup lang="ts">
import { VList } from "virtua/vue";

const test: any = ref([])


const props = withDefaults(defineProps<{
  item: any,
}>(), {})

</script>

<template>
  <div class="w-full flex p-3">
    <!-- <UInput /> -->
    <!-- {{ publicKey }} -->
    <!-- {{ props.item }} -->
    <div class="mr-5">{{ item.info.name }}</div>
    <div class="mr-5">{{ item.info.email }}</div>
     <UBadge>{{ item.status }}</UBadge>

  </div>
</template>
