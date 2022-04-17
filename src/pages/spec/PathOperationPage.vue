<template>
  <q-page v-if="operation" padding>
    <div class="row q-col-gutter-sm">

      <div class="col-12">
        <q-card :class="`bg-${operationName} text-dark q-pa-sm`">
          <q-card-section horizontal class="items-baseline">
            <q-avatar :color="operationName"
                      text-color="dark"
                      rounded
                      class="operation-badge"
            >
              {{ operationName }}
            </q-avatar>
            <div>
              <div class="text-h4">
                {{ title }}
              </div>
              <div class="text-subtitle2">
                {{ decodeURIComponent(route.params.path) }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Parameters</div>
          </q-card-section>
          <q-card-section>
            <q-markup-table flat class="s-table-parameters">
              <thead>
              <tr>
                <th class="col-6 col-md-4 col-lg-3">Name</th>
                <th>Description</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="p of operation.parameters"
                  :key="p.name">
                <td>
                  <div class="inline-block"><strong>{{ p.name }}</strong>
                    <q-badge align="top" label="required" color="red"/>
                  </div>
                  <br/>
                  <strong>{{ p.schema.type }}</strong>({{ p.schema.format }})<br/>
                  <em>({{ p.in }})</em>
                </td>
                <td>
                  <q-input dense
                           outlined
                           :placeholder="p.name"
                  />
                </td>
              </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card class="full-height" v-if="operation.requestBody?.content">
          <q-card-section>
            <div class="text-h6">Request Body</div>
          </q-card-section>

          <q-tabs v-model="visibleRequestBody" align="left">
            <q-tab v-for="(requestBody, requestBodyMediaType) of operation.requestBody?.content"
                   :key="requestBodyMediaType"
                   :name="requestBodyMediaType"
            >
              {{ requestBodyMediaType }}
            </q-tab>
          </q-tabs>

          <q-tab-panels v-model="visibleRequestBody">
            <q-tab-panel v-for="(requestBody, requestBodyMediaType) of operation.requestBody?.content"
                         :key="requestBodyMediaType"
                         :name="requestBodyMediaType"
            >
              <s-json-schema-viewer :schema="requestBody.schema"/>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6">Responses</div>
          </q-card-section>

          <q-tabs v-model="visibleResponseCode" align="left">
            <q-tab v-for="(response, responseCode) of operation.responses"
                   :key="responseCode"
                   :name="responseCode"
            >
              {{ responseCode }} {{ response.description }}
            </q-tab>
          </q-tabs>

          <q-tab-panels v-model="visibleResponseCode">
            <q-tab-panel v-for="(response, responseCode) of operation.responses"
                         :key="responseCode"
                         :name="responseCode"
            >
              <div v-if="response.content">
                <q-expansion-item v-for="(responseContent, responseContentType) of response.content"
                                  :key="responseContentType"
                                  :label="responseContentType"
                                  dense
                >
                  <s-json-schema-viewer :schema="responseContent.schema" />
                </q-expansion-item>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>


      <div class="col-12">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6">Debug</div>
          </q-card-section>

          <q-tabs v-model="debugTab" align="left">
            <q-tab name="spec">Spec</q-tab>
            <q-tab name="path">Path</q-tab>
            <q-tab name="operation">Operation</q-tab>
          </q-tabs>

          <q-tab-panels v-model="debugTab">
            <q-tab-panel name="spec">
              <s-json-viewer :data="spec" />
            </q-tab-panel>
            <q-tab-panel name="path">
              <s-json-viewer :data="path" />
            </q-tab-panel>
            <q-tab-panel name="operation">
              <s-json-viewer :data="operation" />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>

    </div>

  </q-page>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, inject, ref, watch } from 'vue'
import JsonViewer from 'vue-json-viewer'
import SJsonSchemaViewer from 'components/SJsonSchemaViewer'
import SJsonViewer from 'components/SJsonViewer'

const route = useRoute()
const spec = inject('spec')
const visibleRequestBody = ref(null)
const visibleResponseCode = ref(null)
const debugTab = ref(null)

const pathName = computed(() => {
  return route.params.path
    ? Array.isArray(route.params.path)
      ? route.params.path.map(x => decodeURIComponent(x)).join('/')
      : decodeURIComponent(route.params.path)
    : null
})
const path = computed(() => {
  if (route.params.path && spec.value) {
    return spec.value.paths[pathName.value]
  }
  return null
})

const operationName = computed(() => {
  return route.params.operation ? decodeURIComponent(route.params.operation) : null
})
const operation = computed(() => {
  return path.value ? path.value[operationName.value] : null
})

const title = computed(() => {
  if (operation.value.summary) return operation.value.summary
  if (operation.value.operationId) return operation.value.operationId
  return pathName.value
})

function checkTabs (newOperation) {
  if (!newOperation) return

  if (!visibleRequestBody.value || (visibleRequestBody.value && (!newOperation.requestBody || !newOperation.requestBody.content || !newOperation.requestBody.content[visibleRequestBody.value]))) {
    if (!newOperation.requestBody || !newOperation.requestBody.content) {
      visibleRequestBody.value = null
    } else {
      const keys = Object.keys(newOperation.requestBody.content)
      if (keys.length) {
        console.log('set visibleRequestBody to', keys[0])
        visibleRequestBody.value = keys[0]
      }
    }
  }
  if (!visibleResponseCode.value || (visibleResponseCode.value && !newOperation.responses[visibleResponseCode.value])) {
    const keys = Object.keys(newOperation.responses)
    if (keys.length) {
      console.log('set visibleResponseCode to', keys[0])
      visibleResponseCode.value = keys[0]
    }
  }

}

watch(() => operation.value, (newOperation) => {
  checkTabs(newOperation)
}, {
  deep: true
})

if (operation.value) {
  checkTabs(operation.value)
}

</script>

<style scoped>

</style>
