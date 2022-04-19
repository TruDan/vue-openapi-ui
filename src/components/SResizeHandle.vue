<template>
  <div class="s-resize-handle"
       :class="{
        's-resize-handle__horizontal': horizontal,
        's-resize-handle__vertical': !horizontal,
        's-resize-handle__dragging': dragging
       }"
       :style="width && `--rzh-width: ${width}px` || ''"
       @mousedown.passive="startDrag"
  />
</template>

<script setup>
import { defineEmits, defineProps, ref } from 'vue'

const props = defineProps({
  horizontal: {
    type: Boolean,
    default: () => false
  },
  width: {
    type: Number,
    default: () => 3
  },
  modelValue: {
    type: Number
  }
})

const emit = defineEmits([
  'update:modelValue'
])

const dragging = ref(false)
const dragStartValue = ref(0)

function drag({clientX, clientY}) {
  const offset = props.horizontal ? clientY : clientX;
  const newValue = offset - dragStartValue.value;
  emit('update:modelValue', newValue);
}

function drop(e){
  dragging.value = false
  dragStartValue.value = 0;
  document.body.removeEventListener('mousemove', drag, { passive: true })
  document.body.removeEventListener('mouseup', drop, { passive: true })
  document.body.removeEventListener('mouseleave', drop, { passive: true })
}

function startDrag ({
  clientX,
  clientY
}) {
  dragging.value = true

  const offset = props.horizontal ? clientY : clientX;
  dragStartValue.value = offset - props.modelValue

  document.body.addEventListener('mousemove', drag, { passive: true })
  document.body.addEventListener('mouseup', drop, { passive: true })
  document.body.addEventListener('mouseleave', drop, { passive: true })
}

</script>

<style lang="scss">
.s-resize-handle {
  --rzh-width: 1px;
  --rzh-padding: 0.25rem;

  position: absolute;
  right: 0;
  bottom: 0;
  padding: var(--rzh-padding);
  box-sizing: content-box;
  user-select: none !important;

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background-color: $separator-color;

    transition: background-color 0.25s linear;
  }

  &__horizontal {
    left: 0;
    bottom: calc(var(--rzh-padding) * -2);
    cursor: row-resize;
    height: var(--rzh-width);

    &::before {
      top: 50%;
      margin-top: calc(var(--rzh-width) * -0.5);
      height: var(--rzh-width);
    }
  }

  &__vertical {
    top: 0;
    right: calc(var(--rzh-padding) * -2);
    cursor: col-resize;
    width: var(--rzh-width);

    &::before {
      left: 50%;
      margin-left: calc(var(--rzh-width) * -0.5);
      width: var(--rzh-width);
    }
  }

  .body--dark &::before {
    background-color: $separator-dark-color;
  }

  &:hover::before {
    background-color: rgba(255, 0, 255, 0.5) !important;
  }
}
</style>
