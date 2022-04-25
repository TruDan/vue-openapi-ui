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
          <v-ace-editor
            v-model:value="state.requestBody"
            :lang="lang"
            class="full-height"
            :theme="theme"
            :options="aceOptions"
            @init="editorInit"
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
import SInput from 'components/SInput'
import SOperationBadge from 'components/SOperationBadge'
import useOpenapiStore from 'stores/openapi'
import { useQuasar } from 'quasar'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/webpack-resolver'
import ace_modeJson from 'file-loader?esModule=false!ace-builds/src-noconflict/mode-json.js'
import ace_themeLight from 'file-loader?esModule=false!ace-builds/src-noconflict/theme-chrome.js'
import ace_themeDark from 'file-loader?esModule=false!ace-builds/src-noconflict/theme-one_dark.js'
import ace_workerJsonUrl from 'file-loader?esModule=false!ace-builds/src-noconflict/worker-json.js'

ace.require('ace/ext/code_lens')
ace.require('ace/ext/error_marker')
ace.require('ace/ext/keybinding_menu')
ace.require('ace/ext/language_tools')
ace.require('ace/ext/options')
ace.require('ace/ext/searchbox')
ace.require('ace/ext/settings_menu')
ace.require('ace/ext/settings_statusbar')
ace.require('ace/ext/settings_whitespace')
ace.require('ace/keybinding/vscode')
ace.config.setModuleUrl('ace/mode/json', ace_modeJson)
ace.config.setModuleUrl('ace/theme/chrome', ace_themeLight)
ace.config.setModuleUrl('ace/theme/one_dark', ace_themeDark)
ace.config.setModuleUrl('ace/mode/json_worker', ace_workerJsonUrl)

const userstate = useUserstateStore()
const openapi = useOpenapiStore()
const $q = useQuasar()

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

const lang = computed(() => {
  //if(props.operation.)
  return 'json'
})

const theme = computed(() => {
  if ($q.dark.isActive) {
    return 'one_dark'
  }
  return 'chrome'
})

const aceOptions = computed(() => {
  /** @type EditorOptions */
  const opts = {
    enableAutoIndent: true,
    foldStyle: 'markbegin',
    mode: 'ace/mode/json',
    showLineNumbers: true,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: false,
    showPrintMargin: false,
    tabSize: 2
  }
  if (lang.value === 'json') {
    opts.useWorker = true
  }

  return opts
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

/**
 *
 * @param {Ace.Editor} editor
 */
function editorInit (editor) {

}

function onReset () {

}

</script>

<style scoped>

</style>
