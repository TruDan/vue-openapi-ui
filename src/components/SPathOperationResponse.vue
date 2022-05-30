<template>
  <div v-if="hasContent">
    <q-toolbar>
      <q-space/>
      <q-select v-model="selectedContentType"
                label="Media Type"
                :options="contentTypes"
                dense
                outlined
      />
    </q-toolbar>

    <q-tabs v-model="selectedTab" align="left">
      <q-tab name="example">Example</q-tab>
      <q-tab name="schema">Schema</q-tab>
    </q-tabs>

    <q-tab-panels v-model="selectedTab">
      <q-tab-panel name="example">
        <s-json-viewer :data="selectedContent"/>
      </q-tab-panel>
      <q-tab-panel name="schema">
        <s-json-schema-viewer v-if="selectedContent" :schema="selectedContent"/>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { defineProps, computed, ref, onUpdated, onMounted, defineEmits } from 'vue'
import SJsonSchemaViewer from 'components/SJsonSchemaViewer.vue'
import SJsonViewer from 'components/SJsonViewer.vue'

const props = defineProps({
  response: Object
})


const hasContent = computed(() => !!props.response?.content)

const selectedContentType = ref(null)
const contentTypes = computed(() => props.response?.content && Object.keys(props.response.content))

const selectedTab = ref('schema')
const selectedContent = computed(() => selectedContentType.value
  && props.response?.content[selectedContentType.value]
  && props.response?.content[selectedContentType.value].schema
)

function __update () {
  if (!selectedContentType.value) {
    if (contentTypes.value) {
      selectedContentType.value = contentTypes.value[0]
    }
  }
}

onUpdated(() => {
  __update()
})
onMounted(() => {
  __update()
})

</script>

<style scoped>

</style>
