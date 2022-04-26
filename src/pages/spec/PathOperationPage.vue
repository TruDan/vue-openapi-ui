<template>
  <q-page v-if="operation" padding>

    <div class="q-col-gutter-sm">

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
        </div> <!-- /.col-12 -->
      </div> <!-- /.row.q-col-gutter-sm -->

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-lg-6" v-if="userstate.tryMode">
          <s-operation-executor class="full-height"
                                :spec="spec"
                                :operation="operation"
          />
        </div> <!-- /.col-12.col-lg -->

        <div v-if="userstate.tryMode"
             class="col-12 col-lg-6 q-order-lg-8">
          <s-operation-execution-result :spec="spec"
                                        :operation="operation"/>
        </div> <!-- /.col-12.col-lg -->

        <div class="col-12 col-lg-6 q-order-lg-4">
          <q-card v-if="operation.requestBody?.content"
                  class="full-height">

            <q-card-section>
              <div class="text-h6">Request Body</div>
            </q-card-section>

            <s-path-operation-response :response="operation.requestBody"/>
          </q-card>
        </div> <!-- /.col-12.col-lg -->


        <div class="col-12 col-lg-6 q-order-lg-12">
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
        </div> <!-- /.col-12.col-lg -->
      </div> <!-- /.row.q-col-gutter-sm -->

      <div class="row q-col-gutter-sm">
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
          </div> <!-- /.col-12 -->
      </div> <!-- /.row.q-col-gutter-sm -->

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
import SOperationExecutionResult from 'components/SOperationExecutionResult'
import SOperationBadge from 'components/SOperationBadge'
import useUserstateStore from 'stores/userstate'
import SOperationExecutor from 'components/SOperationExecutor'

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
        visibleRequestBody.value = keys[0]
      }
    }
  }
  if (!visibleResponseCode.value || (visibleResponseCode.value && !newOperation.responses[visibleResponseCode.value])) {
    const keys = Object.keys(newOperation.responses)
    if (keys.length) {
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
