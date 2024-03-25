<script setup lang="ts">
const test: any = ref([])
const { $trpc } = useNuxtApp()

// $trpc.data.randomNumber.subscribe(1, {
//   onData(data: any) {
//     console.log(data);
//   }
// })

const name = 'test'

async function add() {
  const res = await $trpc.data.postItem.mutate({
    id: `${Math.floor(Math.random() * 1000)}`,
    schemaId: 'User',
    data: {
      status: 'active',
      date: new Date(),
      info: {
        name,
        email: `${name}@example.com`,
      },
    },
  })
  // console.log('res',res);
  test.value.push(res)
}

// const storage = useLocalStorage<{publicKey: Record<string, any>, privateKey: Record<string, any>} | null>('keys', null)

// const publicKey = computed(() => {
//   return storage.value?.publicKey
// })
</script>

<template>
  <div>
    <!-- <UInput /> -->
    <!-- {{ publicKey }} -->
    <UButton @click="add">
      add
    </UButton>
    <div>{{ test }}</div>
  </div>
</template>
