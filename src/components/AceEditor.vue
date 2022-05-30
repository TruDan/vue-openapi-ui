<template>
  <v-ace-editor
    v-model:value="value"
    :lang="lang"
    :theme="theme"
    :options="aceOptions"
    @init="editorInit"
    :readonly="readonly"
    class="ace-editor full-height"
  />
</template>

<script setup>
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-json.js'
import 'ace-builds/src-noconflict/theme-chrome.js'
import 'ace-builds/src-noconflict/theme-one_dark.js'
import 'ace-builds/src-noconflict/worker-json.js'
import { computed, defineProps, defineEmits } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

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

// ace.config.setModuleUrl('ace/mode/json', ace_modeJson)
// ace.config.setModuleUrl('ace/theme/chrome', ace_themeLight)
// ace.config.setModuleUrl('ace/theme/one_dark', ace_themeDark)
// ace.config.setModuleUrl('ace/mode/json_worker', ace_workerJsonUrl)

const props = defineProps({
  modelValue: {
    type: String
  },
  readonly: {
    type: Boolean,
    default: () => false
  }
})

const emit = defineEmits([
  'update:modelValue'
])

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue)
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

/**
 *
 * @param {Ace.Editor} editor
 */
function editorInit (editor) {

}
</script>

<style scoped lang="scss">
.ace-editor {
  min-height: 20rem;
}
</style>
