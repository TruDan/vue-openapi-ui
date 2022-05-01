<template>
  <div class="s-resize-handle"
       :class="{
        's-resize-handle__horizontal': horizontal,
        's-resize-handle__vertical': !horizontal,
        's-resize-handle__dragging': dragging
       }"
       :style="width && `--rzh-width: ${width}${unit}` || ''"
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
  minValue: {
    type: [String, Number, null],
    required: false
  },
  maxValue: {
    type: [String, Number, null],
    required: false
  },
  unit: {
    type: String,
    default: () => 'px'
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

function getViewport () {

  let viewPortWidth
  let viewPortHeight

  // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
  if (typeof window.innerWidth != 'undefined') {
    viewPortWidth = window.innerWidth
    viewPortHeight = window.innerHeight
  }

// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
  else if (
       typeof document.documentElement != 'undefined'
    && typeof document.documentElement.clientWidth != 'undefined'
    && document.documentElement.clientWidth != 0
  ) {
    viewPortWidth = document.documentElement.clientWidth
    viewPortHeight = document.documentElement.clientHeight
  }

  // older versions of IE
  else {
    viewPortWidth = document.getElementsByTagName('body')[0].clientWidth
    viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
  }

  return {
    width:viewPortWidth,
    height: viewPortHeight
  }
}

function convertUnits (value, sourceUnit, targetUnit) {
  switch (sourceUnit) {
    case '%':
    case 'percent': {
      switch (targetUnit) {
        case '%':
        case 'percent':
          return value

        case 'px':
          const base = (props.horizontal ? getViewport().height : getViewport().width) * 1.0;
          return base * (value / 100.0);
        default:
          break
      }

      break
    }

    case 'px':
    {
      switch (targetUnit) {
        case 'px':
          return value;

        case '%':
        case 'percent':
          const base = (props.horizontal ? getViewport().height : getViewport().width) * 1.0;
          return (value / base) * 100.0
        default:
          break
      }

      break
    }

    default:
      break
  }
  throw new Error(`conversion not implemented!! (${sourceUnit} -> ${targetUnit})`)
}

function normalizeValue (value) {
  const rEx = /^(?<value>\d+(?:\.\d+)?)(?<unit>%|\w*)?$/;
  if (typeof (value) === 'string') {
    const m = value.match(rEx);
    if (m) {
      // all numbers
      const unit = m.groups.unit || props.unit;
      return convertUnits(m.groups.value, unit, props.unit)
    }
  }
}

function bound (value) {
  let boundedValue = normalizeValue(value)
  if (props.minValue !== undefined) {
    boundedValue = Math.max(value, normalizeValue(props.minValue))
  }
  if (props.maxValue !== undefined) {
    boundedValue = Math.min(value, normalizeValue(props.maxValue))
  }
  return boundedValue
}

function drag ({
  clientX,
  clientY
}) {
  const offset = props.horizontal ? clientY : clientX
  const newValue = convertUnits(offset - dragStartValue.value, 'px', props.unit)
  emit('update:modelValue', bound(newValue))
}

function drop (e) {
  dragging.value = false
  dragStartValue.value = 0
  document.body.removeEventListener('mousemove', drag, { passive: true })
  document.body.removeEventListener('mouseup', drop, { passive: true })
  document.body.removeEventListener('mouseleave', drop, { passive: true })
}

function startDrag ({
  clientX,
  clientY
}) {
  const offset = props.horizontal ? clientY : clientX
  if(!props.modelValue) {
    //emit('update:modelValue', offset)
    return;
  }

  dragging.value = true

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
    bottom: calc(var(--rzh-width) * -2);
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
    right: calc(var(--rzh-width) * -2);
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
