<template>
  <response-viewer v-if="execution"
                   :response="execution.response"
  >
    <template #before>
      <q-card-section>
        <s-http-status-code-badge :code="execution.statusCode"/>
        <code>{{ execution.response?.url }}</code>
      </q-card-section>

      <q-card-section v-if="execution.error">
        <q-banner class="bg-negative text-white">
          <q-icon name="warning"/>
          {{ execution.error }}
        </q-banner>
      </q-card-section>
    </template>

  </response-viewer>
</template>

<script setup>

import { defineProps, watch, onMounted, ref } from 'vue'
import useUserstateStore from 'stores/userstate'
import SHttpStatusCodeBadge from 'components/SHttpStatusCodeBadge.vue'
import ResponseViewer from 'components/ResponseViewer.vue'

const props = defineProps({
  spec: {
    type: Object,
    required: true
  },
  operation: {
    type: Object,
    required: true
  }
})

const execution = ref(null)

const userstate = useUserstateStore()

function updateExecution () {
  execution.value = userstate.createTryModeExecution(props.spec.$$name, props.operation.operationId)
}

watch(() => props, () => {
  updateExecution()
}, { deep: true })

onMounted(() => updateExecution())

</script>

<style scoped>

</style>
