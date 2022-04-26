<template>
  <div class="jv-container" v-if="jsonTree" ref="root">
    <q-tree tick-strategy="none"
            class="jsontree jv-code"
            default-expand-all
            :nodes="jsonTree"
            node-key="key"
            label-key="title"
    >
      <template #default-header="{ node, expanded }">
        <div class="jv-node"
             :data-key="node.key"
             :data-expanded="expanded"
             :data-type="node.type">
          <div class="row items-baseline">
            <div class="text-no-wrap col-auto" v-if="node.title">
              <span class="text-weight-bold jv-key">
                {{ node.title }}
              </span>
              <span>:</span>
            </div>
            <div class="col q-ml-sm">
              <span :class="`jv-item jv-${node.type}`">{{ node.value }}</span>
            </div>
          </div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script setup>
import { defineProps, nextTick, onMounted, onUpdated, ref, watch } from 'vue'

const root = ref(null)

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const jsonTree = ref([])

function handleNodeClick (node) {
  const el = root.value.querySelector(`[data-key="${node.key.replace(/[\[\]\"]/g, '\\$1')}"]`)
  nextTick(() => updateNodeClasses(el))
}

function updateNodeClasses (e) {
  const tn = e.closest('.q-tree__node')
  tn.classList.toggle('q-tree__node--expanded', (e.dataset.expanded === 'true'))
  for (const key of tn.classList.keys()) {
    if (/^jv-/.test(key)) {
      tn.classList.remove(key)
    }
  }
  tn.classList.add(`jv-${e.dataset.type}`)
}

function updateClasses () {
  if (root.value) {
    root.value.querySelectorAll('[data-expanded]').forEach(e => {
      updateNodeClasses(e)
    })
  }
}

function jsonNodeToTreeNode (jsonNode, nodePath) {
  let children = []
  const node = {
    key: nodePath,
    type: typeof (jsonNode),
    typeTitle: jsonNode.title || jsonNode.$title || '',
    children: children
  }

  if (jsonNode === null || jsonNode === undefined) {
    node.type = 'null'
    node.value = 'null'
  } else if (Array.isArray(jsonNode)) {
    node.type = 'array'
    node.header = 'array'
    children.push(...jsonNode.map((arrayNode, index) => ({
        title: `[${index}]`,
        ...jsonNodeToTreeNode(arrayNode, `${nodePath}[${index}]`)
      })
    ))
  } else if (node.type === 'object') {
    children.push(...Object.entries(jsonNode).map(([propertyKey, propertyNode]) => ({
        title: `"${propertyKey}"`,
        ...jsonNodeToTreeNode(propertyNode, [nodePath, propertyKey].join('.'))
      })
    ))
  } else if (node.type === 'string') {
    node.value = `"${jsonNode}"`
  } else {
    node.value = jsonNode
  }

  if (children.length) {
    node.handler = handleNodeClick
  } else {
    node.children = undefined
  }

  return node
}

function updateJsonTree (data) {
  jsonTree.value = [jsonNodeToTreeNode(data, 'root')]
}

watch(() => props.data, (data) => {
  updateJsonTree(data)
}, {
  deep: true
})

onMounted(() => {
  updateClasses()
})

onUpdated(() => {
  updateClasses()
})

if (props.data) {
  updateJsonTree(props.data)
}

</script>
