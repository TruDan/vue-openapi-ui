<template>
  <q-slide-transition>
    <q-card square v-if="response" class="full-height">
      <slot name="before"/>

      <q-card-section v-if="response.headers">
        <q-markup-table square flat dense>
          <tbody>
          <tr v-for="(headerValue, headerKey) of response.headers"
              :key="headerKey">
            <th>{{ headerKey }}</th>
            <td>{{ headerValue }}</td>
          </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>

      <q-card-section v-if="response.body">
        <div class="row q-my-sm">
          <q-space/>
          <q-btn-toggle v-model="viewMode"
                        :options="viewModes"
                        size="sm"
                        no-caps
                        rounded
                        unelevated
                        toggle-color="primary"
                        class="q-btn-toggle-bordered"
          />
        </div>

        <s-json-viewer v-if="viewMode === 'tree'" :data="response.body"/>
        <ace-editor v-if="viewMode === 'ace'" v-model="responseText" readonly
                    class="full-height"/>
      </q-card-section>

      <slot name="after"/>
    </q-card>
  </q-slide-transition>
</template>

<script setup>
import AceEditor from 'components/AceEditor'
import SJsonViewer from 'components/SJsonViewer'
import { ref, defineProps, computed } from 'vue'

const props = defineProps({
  response: {
    type: Object
  }
})

const viewMode = ref('ace')
const viewModes = ref([
  {
    label: 'Tree View',
    value: 'tree'
  },
  {
    label: 'Code View',
    value: 'ace'
  },
  {
    label: 'Raw View',
    value: 'raw'
  }
])

const responseText = computed({
  get: () => {
    if(!props.response?.body)
      return null;

    return JSON.stringify(props.response.body, null, '\t');
  },
  set: () => {}
})

</script>

<style scoped>

</style>
