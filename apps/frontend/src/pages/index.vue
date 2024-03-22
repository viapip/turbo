<script setup>
const { t } = useI18n()
</script>

<template>
  <WinboxWindow
    :params="{
      id: 'page-current',
      teleportId: 'teleport-layer--10',
      title: t('current.title'),
      class: ['wb-left', 'no-close'],
      border: 0,
      top: -1,
      left: 40,
      bottom: -1,
      right: -1,
      width: 550,
      minwidth: 300,
      tether: ['left', 'top', 'bottom'],
    }"
  >
    <Test />
  </WinboxWindow>
</template>
