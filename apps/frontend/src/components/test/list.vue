<script setup lang="ts">
import TestItem from "./item.vue";
import type { _maxHeight } from "#tailwind-config/theme";
import { VList, Virtualizer } from "virtua/vue";

const {$trpc} = useNuxtApp()
// $trpc.data.randomNumber.subscribe(1, {
//   onData(data: any) {
//     console.log(data);
//   }
// })
const items: any = ref([])

const sizes = [20, 40, 180, 77];
const data = Array.from({ length: 1000 }).map((_, i) => ({
  id: i,
  size: sizes[i % 4] + "px",
}));

const name = 'test'


items.value = await $trpc.data.getAll.query()
console.log(items.value);

// const storage = useLocalStorage<{publicKey: Record<string, any>, privateKey: Record<string, any>} | null>('keys', null)

// const publicKey = computed(() => {
//   return storage.value?.publicKey
// })

async function itemGetter(id: string) {
  const item = await $trpc.data.getItem.query(id)
  return computed(() => {
    return item
  })
}
const itemsId = computed(() => {
  const ids = items.value.map((item: any) => item._id)
  console.log(ids);

  return ids
})
function onScroll(test: any) {
  console.log(test);
}
</script>

<template>
  <div class="w-full  overflow-hidden">
    <div class="h-60">
    <VList :data="items"  #default="item" @scroll="onScroll"  :item-size="48">
        <TestItem :item="item" />
    </VList>
    </div>
    <div class="h-60 mt-11 border overflow-hidden ">
      <VirtualList
        v-if="itemsId.length > 0"
        :key="'objectFields-virtuallist'"
        class="h-full overflow-auto"
        :keeps="20"
        wrap-class="h-60"
        :data-key="'objectFields-virtuallist'"
        :page-mode="false"
        :data-ids="itemsId"
        :item-class="'pb-4'"
        :data-getter="itemGetter"
        :data-component="TestItem"
        :estimate-size="76"
      />
    </div>
  </div>
</template>
