<script setup lang="ts">
import type { ComputedRef, PropType } from 'vue'

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  tag: {
    type: String,
    default: 'div',
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
  slotComponent: {
    type: Function,
  },
  estimateSize: {
    type: Number,
    default: 100,
  },

  dataId: {
    type: String,
    required: true,
  },
  dataKey: {
    type: String,
    default: '',
  },
  dataGetter: {
    type: Function as PropType<
      <T extends Record<string, any>>(
        id: string
      ) => Promise<ComputedRef<T> | undefined>
    >,
    required: true,
  },
  dataComponent: {
    type: [Object, Function],
    required: false,
  },

  extraProps: {
    type: Object as PropType<Record<string, any>>,
  },
  scopedSlots: {
    type: Object,
  },
  itemClass: {
    type: String,
  },
})

const emit = defineEmits<{
  (event: 'resize', id: string, size: number, init: boolean): void
  (event: 'action', data: { id: string; [key: string]: any }): void
}>()

const index = toRef(props, 'index')
const dataId = toRef(props, 'dataId')

const item = await props.dataGetter(dataId.value)

const rootRef = ref<HTMLElement | null>(null)
const horizontal = toRef(props, 'horizontal')
const shapeKey = computed<'width' | 'height'>(() =>
  horizontal.value ? 'width' : 'height'
)

const resizeObserver = useResizeObserver(rootRef, (entries) => {
  if (entries.length > 0) {
    emit('resize', dataId.value, entries[0].contentRect[shapeKey.value], false)
  }
})

onMounted(dispatchSizeChange)
onActivated(dispatchSizeChange)

onDeactivated(resizeObserver.stop)
onUnmounted(resizeObserver.stop)

function dispatchSizeChange() {
  if (rootRef.value) {
    const entries = rootRef.value.getClientRects()
    if (entries.length > 0) {
      emit('resize', dataId.value, entries[0][shapeKey.value], true)
    }
  }
}
</script>

<template>
  <KeepAlive :key="`${props.dataKey}-listitem_keepapive-${dataId}-${index}`">
    <Component
      :is="props.tag"
      v-if="item"
      ref="rootRef"
      :key="`${props.dataKey}-listitem_tag-${dataId}-${index}`"
    >
      <Component
        v-bind="{
          scopedSlots: props.scopedSlots,
          extraProps: props.extraProps,
          dataKey: props.dataKey,
          index,
          item,
        }"
        :is="props.dataComponent"
        v-if="props.dataComponent"
        :key="`${props.dataKey}-listitem_component-${dataId}-${index}`"
        :class="props.itemClass"
        @action="(e:any) => emit('action', {id:dataId,...e})"
      />
      <Component
        :is="props.slotComponent"
        v-else-if="props.slotComponent"
        :key="`${props.dataKey}-listitem_slotcomponent-${dataId}-${index}`"
        :class="props.itemClass"
      />
    </Component>
    <Component
      :is="props.tag"
      v-else
      :key="`${props.dataKey}-listitem_placeholder-${dataId}-${index}`"
      :style="{
        display: 'block',
        height: `${props.estimateSize}px`,
      }"
    />
  </KeepAlive>
</template>
