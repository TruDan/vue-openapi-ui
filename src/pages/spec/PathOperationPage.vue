<template>
  <q-page v-if="operation" padding>
    <div class="row q-col-gutter-sm">

      <div class="col-12">
        <div>
          <div class="text-h4">
            {{ title }}
          </div>
          <div class="row items-center q-gutter-sm path-detail-row">
            <s-operation-badge :operation="operationName"/>
            <div class="text-subtitle2">
              {{ decodeURIComponent(pathName) }}
            </div>
          </div>
        </div>
        <q-markdown v-if="operation.description">{{ operation.description }}</q-markdown>
      </div>

      <q-slide-transition>
        <div class="col-12" v-show="userstate.tryMode">
          <q-card square flat>
            <q-card-section>
              <div class="text-h6">Try It</div>
            </q-card-section>

            <q-card-section>
              <div class="text-h6">Parameters</div>
              <q-markup-table dense
                              square
                              wrap-cells
                              flat
                              separator="none">
                <tbody>
                <tr v-for="p of operation.parameters"
                    :key="p.name"
                    class="s-parameter">
                  <td>
                    <code>
                      <strong v-text="p.in === 'path' ? `{${p.name}}` : p.name"/>
                      <strong v-if="p.required" class="text-red text-super q-ml-xs">*</strong>
                    </code>
                    <br/>
                    <em class="text-caption s-parameter__type">{{ p.schema.type }}<span
                      v-if="p.schema.format">({{ p.schema.format }})</span></em>
                  </td>
                  <td>
                    <q-input
                      class="s-parameter__input"
                      dense
                      filled
                      borderless
                      square
                    />
                  </td>
                </tr>
                </tbody>
              </q-markup-table>
            </q-card-section>

            <q-card-section>
              <q-input type="textarea"
                       label="Body"
                       stack-label
                       autogrow
                       dense
                       borderless
                       filled
                       square
                       class="s-parameter-input">

              </q-input>
            </q-card-section>

            <q-card-actions>
              <q-btn color="primary">Execute</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </q-slide-transition>

      <div class="col-12 col-lg-6">
        <q-card class="full-height" v-if="operation.requestBody?.content">
          <q-card-section>
            <div class="text-h6">Request Body</div>
          </q-card-section>

          <s-path-operation-response :response="operation.requestBody"/>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6">Responses</div>
          </q-card-section>

          <q-expansion-item v-for="(response, responseCode) of operation.responses"
                            :key="responseCode"
                            :name="responseCode"
                            default-opened
                            dense
          >
            <template #header>
              <q-item-section side>
                <s-http-status-code-badge :code="responseCode" text/>
              </q-item-section>
              <q-item-section>
                {{ response.description }}
              </q-item-section>
            </template>

            <s-path-operation-response :response="response"/>
          </q-expansion-item>
        </q-card>
      </div>


      <q-slide-transition>
        <div class="col-12" v-show="userstate.debugMode">
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
                <s-json-viewer :data="spec"/>
              </q-tab-panel>
              <q-tab-panel name="path">
                <s-json-viewer :data="path"/>
              </q-tab-panel>
              <q-tab-panel name="operation">
                <s-json-viewer :data="operation"/>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </q-slide-transition>

    </div>

  </q-page>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, inject, ref, watch } from 'vue'
import JsonViewer from 'vue-json-viewer'
import SJsonSchemaViewer from 'components/SJsonSchemaViewer'
import SJsonViewer from 'components/SJsonViewer'
import SHttpStatusCodeBadge from 'components/SHttpStatusCodeBadge'
import SPathOperationResponse from 'components/SPathOperationResponse'
import SOperationBadge from 'components/SOperationBadge'
import { useUserstateStore } from 'stores/userstate'

const userstate = useUserstateStore()
const route = useRoute()
const spec = inject('spec')
const visibleRequestBody = ref(null)
const visibleResponseCode = ref(null)
const debugTab = ref(null)

const pathName = computed(() => {
  return route.params.specpath
    ? Array.isArray(route.params.specpath)
      ? route.params.specpath.map(x => decodeURIComponent(x)).join('/')
      : decodeURIComponent(route.params.specpath)
    : null
})
const path = computed(() => {
  if (route.params.specpath && spec.value) {
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

<style scoped lang="scss">
.path-detail-row {
  font-size: 1.125rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;

  ::v-deep(.operation-badge) {
    font-size: 2rem;
  }
}
</style>
