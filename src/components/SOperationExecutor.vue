<template>

  <q-slide-transition>
    <div class="col-12" v-show="userstate.tryMode">
      <q-card square flat>
        <q-card-section>
          <div class="text-h6">
            <div class="row items-center q-gutter-sm path-detail-row">
              <s-operation-badge :operation="operation.path"/>
              <div class="text-subtitle2">
                {{ decodeURIComponent(pathName) }}
              </div>
            </div>
          </div>
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
              <td>
                {{ p.description }}
              </td>
            </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>

        <q-card-section v-if="operation.requestBody">
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
          <div>
            <q-btn color="primary" padding="xs xl" disable>
              Try
            </q-btn>
            <q-tooltip>Coming Soon!</q-tooltip>
          </div>
        </q-card-actions>
      </q-card>
    </div>
  </q-slide-transition>
</template>

<script setup>

import { useUserstateStore } from 'stores/userstate'
import { defineProps } from 'vue'

const userstate = useUserstateStore()

const props = defineProps({
  operation: {
    type: Object,
    required: true
  }
})

</script>

<style scoped>

</style>
