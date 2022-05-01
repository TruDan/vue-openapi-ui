<template>
  <q-avatar class="operation-badge"
            :class="{
              'operation-badge__text': text,
              [`text-${operation}`]: text,
              [`bg-${operation}`]: !text,
            }">
    {{ operation }}
  </q-avatar>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  operation: String,
  text: {
    type: Boolean,
    default: () => false
  }
})

</script>
