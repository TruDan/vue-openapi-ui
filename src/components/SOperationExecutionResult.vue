<template>

  <q-slide-transition>
    <q-card square flat v-if="execution">
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

      <q-card-section v-if="execution.response">
        <s-json-viewer :data="execution"/>
      </q-card-section>

    </q-card>
  </q-slide-transition>
</template>

<script setup>

import { defineProps, watch, onMounted, ref } from 'vue'
import useUserstateStore from 'stores/userstate'
import SHttpStatusCodeBadge from 'components/SHttpStatusCodeBadge'
import SJsonViewer from 'components/SJsonViewer'

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
