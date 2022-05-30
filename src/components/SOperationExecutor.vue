<template>
  <q-slide-transition>
    <q-card square flat>

      <q-form class="full-height flex column"
              @submit="onSubmit"
              @reset="onReset"
              :disable="loading">

        <q-card-section>
          <div class="text-h6">
            <div class="row items-center q-gutter-sm path-detail-row">
              <s-operation-badge :operation="operation.$$operation"/>
              <div class="text-subtitle2">
                {{ decodeURIComponent(operation.$$path) }}
              </div>
            </div>
          </div>


          <q-markup-table dense
                          square
                          wrap-cells
                          flat
                          separator="none">
            <tbody>
            <tr v-for="(p, i) of operation.parameters"
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
                <s-input
                  v-model="state.values[i]"
                  :schema="p.schema"
                  class="s-parameter__input"
                  dense
                  filled
                  borderless
                  square
                />
              </td>
              <td>
                {{ p.description }}
              </td>
            </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>

        <q-card-section v-if="operation.requestBody" class="col-grow">
          <ace-editor
            v-model="state.requestBody"
            class="full-height"
          />
        </q-card-section>

        <q-card-actions>
          <q-btn color="primary" padding="xs xl" type="submit" :loading="loading">
            Try
          </q-btn>
          <q-btn color="default" type="reset" padding="xs xl" :disable="loading">Clear fields</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-slide-transition>
</template>

<script setup>


import useUserstateStore from 'stores/userstate'
import { computed, defineEmits, defineProps, onMounted, reactive, ref, watch } from 'vue'
import SInput from 'components/SInput.vue'
import SOperationBadge from 'components/SOperationBadge.vue'
import useOpenapiStore from 'stores/openapi'
import { useQuasar } from 'quasar'
import AceEditor from 'components/AceEditor.vue'

const userstate = useUserstateStore()
const openapi = useOpenapiStore()

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

const state = reactive({
  values: [],
  requestBody: ''
})
const loading = ref(false)

const onSubmit = () => {
  const values = Object.fromEntries(state.values.map((v, i) => ([props.operation.parameters[i].name, v])))
  loading.value = true

  openapi.executeOperation(props.spec, props.operation.operationId, values)
    .then(response => {
      loading.value = false;
    })
}

function onReset () {

}

</script>

<style scoped>

</style>
