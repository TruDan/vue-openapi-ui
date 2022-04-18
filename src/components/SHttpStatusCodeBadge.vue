<template>
  <q-avatar class="operation-badge"
            :color="!text && color"
            :text-color="text && color"
            square>
    {{ code }}
  </q-avatar>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  code: Number,
  text: {
    type: Boolean,
    default: () => false
  }
})

const color = computed(() => {
  const { code } = props;
  if(code >= 100 && code < 200) { // Informational Response
    return 'info';
  }
  else if(code >= 200 && code < 300) { // Success
    return 'positive';
  }
  else if(code >= 300 && code < 400) { // Redirection
    return 'secondary';
  }
  else if(code >= 400 && code < 500) { // Client Errors
    return 'negative';
  }
  else if(code >= 500 && code < 600) { // Server Errors
    return 'negative';
  }

  return 'default';
});

</script>
