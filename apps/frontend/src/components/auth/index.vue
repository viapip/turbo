<script setup lang="ts">
const isOpen = ref(false)
</script>

<template>
  <div class="flex items-center mt-10">
    <UButton class="mr-6" @click="isOpen = true">
      input keys
    </UButton>

    <UModal v-model="isOpen">
      <div class="p-4">
        <UInput />
        <UInput />
      </div>
    </UModal>
  </div>
</template>
