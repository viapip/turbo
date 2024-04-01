<script setup lang="ts">
import type { ComputedRef, PropType } from 'vue'
import { range } from '@antfu/utils'
import type { VirtualRange } from '~/composables/virtual'
import Virtual from '~/composables/virtual'
const props = defineProps({
  dataIds: {
    type: Array as PropType<string[]>,
    default: () => [] as string[],
  },
  dataGetter: {
    type: Function as PropType<(id: string) => Promise<ComputedRef>>,
    required: true,
  },
  dataComponent: {
    type: [Object, Function],
    required: false,
  },
  dataKey: {
    type: String,
    default: '',
  },
  dataCursor: {
    type: Number,
    default: () => 0,
  },
  keeps: {
    type: Number,
    default: 30,
  },
  extraProps: {
    type: Object,
  },
  estimateSize: {
    type: Number,
    default: 100,
  },
  direction: {
    type: String,
    default: 'vertical', // the other value is horizontal
  },
  start: {
    type: Number,
    default: 0,
  },
  offset: {
    type: Number,
    default: 0,
  },
  topThreshold: {
    type: Number,
    default: 0,
  },
  bottomThreshold: {
    type: Number,
    default: 0,
  },
  pageMode: {
    type: Boolean,
    default: false,
  },
  rootTag: {
    type: String,
    default: 'div',
  },
  wrapTag: {
    type: String,
    default: 'div',
  },
  wrapClass: {
    type: String,
    default: '',
  },
  wrapStyle: {
    type: Object,
    default: () => ({}),
  },
  itemWrapTag: {
    type: String,
    default: 'div',
  },
  itemTag: {
    type: String,
    default: 'div',
  },
  itemClass: {
    type: String,
    default: '',
  },
  itemClassAdd: {
    type: Function as PropType<(i: number) => string>,
  },
  itemStyle: {
    type: Object,
  },
  headerTag: {
    type: String,
    default: 'div',
  },
  headerClass: {
    type: String,
    default: '',
  },
  headerStyle: {
    type: Object,
  },
  footerTag: {
    type: String,
    default: 'div',
  },
  footerClass: {
    type: String,
    default: '',
  },
  footerStyle: {
    type: Object,
  },
  itemScopedSlots: {
    type: Object,
  },
})
const emit = defineEmits<{
  (event: 'scroll', evt: UIEvent, r: VirtualRange): void
  (event: 'resized', id: string, size: number): void
  (event: 'totop'): void
  (event: 'tobottom'): void
  (event: 'itemClick', id: string): void
  (event: 'itemAction', data: { id: string; [key: string]: any }): void
}>()
const slots = useSlots()
const rootRef = ref<HTMLElement | null>(null)
const shepherdRef = ref<HTMLElement | null>(null)
const direction = toRef(props, 'direction')
const dataIds = toRef(props, 'dataIds')
const isHorizontal = computed(() => direction.value === 'horizontal')
const offsetSizeKey = computed<'scrollLeft' | 'scrollTop'>(() => {
  return isHorizontal.value ? 'scrollLeft' : 'scrollTop'
})
const clientSizeKey = computed<'clientWidth' | 'clientHeight'>(() => {
  return isHorizontal.value ? 'clientWidth' : 'clientHeight'
})
const scrollSizeKey = computed<'scrollWidth' | 'scrollHeight'>(() => {
  return isHorizontal.value ? 'scrollWidth' : 'scrollHeight'
})
const wrapperStyle = ref<Record<string, any>>({})
const vr = ref<[number, number]>([
  Math.max(props.start, 0),
  Math.min(props.start + props.keeps, dataIds.value.length),
])
const v = new Virtual(
  {
    slotHeaderSize: 0,
    slotFooterSize: 0,
    keeps: props.keeps,
    estimateSize: props.estimateSize,
    buffer: Math.round(props.keeps / 3),
    uniqueIds: dataIds.value.slice(),
  },
  onRangeChanged
)
defineExpose({
  rootRef,
  scrollToIndex,
  scrollToOffset,
  scrollToBottom,
  v,
})
onMounted(() => {
  // in page mode we bind scroll event to document
  if (props.pageMode) {
    updatePageModeFront()
    document.addEventListener('scroll', onScroll, {
      passive: false,
    })
  }
  // set position
  onScroll(new Event('scroll'))
})
onUnmounted(() => {
  if (props.pageMode) {
    document.removeEventListener('scroll', onScroll)
  }
})
// set back offset when awake from keep-alive
onActivated(() => {
  if (props.pageMode) {
    updatePageModeFront()
    document.addEventListener('scroll', onScroll, {
      passive: false,
    })
  }
  onScroll()
})
onDeactivated(() => {
  if (props.pageMode) {
    document.removeEventListener('scroll', onScroll)
  }
})
watch(
  () => dataIds.value,
  (dataIds) => {
    v.updateParam('uniqueIds', dataIds.slice())
    v.handleDataSourcesChange()
  }
)
watch(
  () => props.keeps,
  (keeps) => {
    v.updateParam('keeps', keeps)
    v.handleSlotSizeChange()
  }
)
watch(
  () => props.start,
  (start) => {
    scrollToIndex(start)
  }
)
watch(
  () => props.offset,
  (offset) => {
    scrollToOffset(offset)
  }
)
// return current scroll offset
function getOffsetSize() {
  if (props.pageMode) {
    return (
      document.documentElement[offsetSizeKey.value] ||
      document.body[offsetSizeKey.value]
    )
  }
  return rootRef.value ? Math.ceil(rootRef.value[offsetSizeKey.value]) : 0
}
// return client viewport size
function getClientSize() {
  if (props.pageMode) {
    return (
      document.documentElement[clientSizeKey.value] ||
      document.body[clientSizeKey.value]
    )
  }
  return rootRef.value ? Math.ceil(rootRef.value[clientSizeKey.value]) : 0
}
// return all scroll size
function getScrollSize() {
  if (props.pageMode) {
    return (
      document.documentElement[scrollSizeKey.value] ||
      document.body[scrollSizeKey.value]
    )
  }
  return rootRef.value ? Math.ceil(rootRef.value[scrollSizeKey.value]) : 0
}
// set current scroll position to a expectant offset
function scrollToOffset(offset: number) {
  if (props.pageMode) {
    document.body[offsetSizeKey.value] = offset
    document.documentElement[offsetSizeKey.value] = offset
    return
  }
  if (rootRef.value) {
    rootRef.value[offsetSizeKey.value] = offset
  }
}
// set current scroll position to a expectant index
function scrollToIndex(index: number) {
  if (index < dataIds.value.length) {
    const offset = v.getOffset(index)
    scrollToOffset(offset)
    return
  }
  scrollToBottom()
}
// set current scroll position to bottom
function scrollToBottom() {
  if (!shepherdRef.value) {
    return
  }
  const offset =
    shepherdRef.value[isHorizontal.value ? 'offsetLeft' : 'offsetTop']
  scrollToOffset(offset)
  // check if it's really scrolled to the bottom
  // maybe list doesn't render and calculate to last range
  // so we need retry in next event loop until it really at bottom
  setTimeout(() => {
    if (getOffsetSize() + getClientSize() < getScrollSize()) {
      scrollToBottom()
    }
  }, 30)
}
// when using page mode we need update slot header size manually
// taking root offset relative to the browser as slot header size
function updatePageModeFront() {
  if (!rootRef.value) {
    return
  }
  const { defaultView } = rootRef.value.ownerDocument
  if (!defaultView) {
    return
  }
  const rect = rootRef.value.getBoundingClientRect()
  const offsetFront = isHorizontal.value
    ? rect.left + defaultView!.pageXOffset
    : rect.top + defaultView!.pageYOffset
  v.updateParam('slotHeaderSize', offsetFront)
}
// event called when each item mounted or size changed
function onItemResized(id: string, size: number) {
  v.saveSize(id, size)
  emit('resized', id, size)
}
// event called when slot mounted or size changed
function onSlotResized(type: string, size: number, init: boolean) {
  switch (type) {
    case 'thead':
      v.updateParam('slotHeaderSize', size)
      break
    case 'tfoot':
      v.updateParam('slotFooterSize', size)
      break
  }
  if (init) {
    v.handleSlotSizeChange()
  }
}
// here is the rerendering entry
function onRangeChanged(r: VirtualRange) {
  vr.value = [r.start, r.end + 1]
  wrapperStyle.value = getWrapperStyle(r.padBehind, r.padFront)
}
function onScroll(evt?: Event) {
  const offsetSize = getOffsetSize()
  const clientSize = getClientSize()
  const scrollSize = getScrollSize()
  // iOS scroll-spring-back behavior will make direction mistake
  if (
    offsetSize < 0 ||
    offsetSize + clientSize > scrollSize + 1 ||
    !scrollSize
  ) {
    return
  }
  emitScrollEvent(offsetSize, clientSize, scrollSize, evt)
  v.handleScroll(Math.max(0, offsetSize - clientSize / 2))
}
// emit event in special position
function emitScrollEvent(
  offsetSize: number,
  clientSize: number,
  scrollSize: number,
  evt?: Event
) {
  emit('scroll', evt as UIEvent, v.getRange())
  if (
    v.isFront() &&
    dataIds.value.length > 0 &&
    offsetSize - props.topThreshold <= 0
  ) {
    emit('totop')
    return
  }
  if (
    v.isBehind() &&
    offsetSize + clientSize + props.bottomThreshold >= scrollSize
  ) {
    emit('tobottom')
  }
}
function getWrapperStyle(
  padBehind: number,
  padFront: number
): Record<string, any> {
  return {
    ...props.wrapStyle,
    padding: isHorizontal.value
      ? `0px ${padBehind}px 0px ${padFront}px`
      : `${padFront}px 0px ${padBehind}px`,
  }
}
</script>

<template>
  <Component
    :is="props.rootTag"
    :key="`${props.dataKey}-list_root`"
    ref="rootRef"
    role="list"
    @scroll="(evt: UIEvent) => !props.pageMode && onScroll(evt)"
  >
    <!-- <div class="top-0 left-0 fixed">{{ vr }}</div> -->
    <VirtualListSlot
      :key="`${props.dataKey}-list_header`"
      :tag="props.headerTag"
      :class="props.headerClass"
      :style="props.headerStyle"
      data-id="thead"
      @resize="onSlotResized"
    >
      <slot name="header" />
    </VirtualListSlot>

    <Component
      :is="props.wrapTag"
      :key="`${props.dataKey}_list_wrap`"
      :class="props.wrapClass"
      :style="wrapperStyle"
      role="group"
    >
      <Component
        :is="props.itemWrapTag"
        v-for="i in range(...vr).concat()"
        :key="`${props.dataKey}-list_component-${dataIds[i]}-${i}`"
        role="listitem"
      >
        <!-- {{ props.extraProps }} -->
        <VirtualListItem
          :index="i"
          :tag="props.itemTag"
          :style="props.itemStyle"
          :horizontal="isHorizontal"
          :data-id="dataIds[i]"
          :data-key="props.dataKey"
          :data-getter="props.dataGetter"
          :extra-props="props.extraProps"
          :estimate-size="v.getEstimateSize()"
          :data-component="props.dataComponent"
          :slot-component="slots && slots.item"
          :scoped-slots="props.itemScopedSlots"
          :item-class="
            props.itemClass +
            (props.itemClassAdd ? ` ${props.itemClassAdd(i)}` : '')
          "
          @click="emit('itemClick', dataIds[i])"
          @action="(e:any)=>emit('itemAction', e)"
          @resize="onItemResized"
        />
      </Component>
    </Component>

    <VirtualListSlot
      :key="`${props.dataKey}-list_footer`"
      :class="props.footerClass"
      :style="props.footerStyle"
      :tag="props.footerTag"
      data-id="tfoot"
      @resize="onSlotResized"
    >
      <slot name="footer" />
    </VirtualListSlot>
  </Component>
</template>
