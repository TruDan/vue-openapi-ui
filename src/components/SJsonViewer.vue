<template>
  <div class="jv-container" v-if="jsonTree">
    <q-tree tick-strategy="none"
            class="jsontree jv-code"
            default-expand-all
            :nodes="jsonTree"
            node-key="key"
            label-key="title"
    >
      <template #header-end-object>
        <div class="jv-node">
          <div class="row items-center">
            <div class="text-no-wrap jv-item jv-object">}</div>
          </div>
        </div>
      </template>

      <template #header-end-array>
        <div class="jv-node">
          <div class="row items-center">
            <div class="text-no-wrap jv-item jv-array">]</div>
          </div>
        </div>
      </template>

      <template #header-array-item="{ node }">
        <div class="jv-node">
          <div class="row items-center">
            <div class="text-no-wrap text-weight-bold jv-key" v-if="!node.value">{{ node.title || node.$title }}</div>
            <div class="text-caption q-ml-sm jv-item" :class="`jv-${node.type}`">{{ node.value }}</div>
          </div>
        </div>
      </template>

      <template #header-array="{ node, expanded }">
        <div class="jv-node">
          <div class="row items-center">
            <div class="text-no-wrap text-weight-bold jv-key">{{ node.title || node.$title }}</div>
            :
            <div class="text-caption q-ml-sm jv-item" :class="`jv-${node.type}`">{{ node.value }}</div>
            <template v-if="node.children">
              <em>
                <span class="jv-item jv-array">[</span>
                <span class="jv-ellipsis" v-if="!expanded">...</span>
                <span class="jv-item jv-array" v-if="!expanded">]</span>
              </em>
            </template>
          </div>
        </div>
      </template>

      <template #default-header="{ node, expanded }">
        <div class="jv-node">
          <div class="row items-center">
            <div class="text-no-wrap text-weight-bold jv-key">{{ node.title || node.$title }}</div>
            :
            <div class="text-caption q-ml-sm jv-item" :class="`jv-${node.type}`">{{ node.value }}</div>
            <template v-if="node.children">
              <span class="jv-item jv-object">{</span>
              <span class="jv-ellipsis" v-if="!expanded">...</span>
              <span class="jv-item jv-object" v-if="!expanded">}</span>
            </template>
          </div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const jsonTree = ref([])

function jsonNodeToTreeNode (jsonNode, nodePath) {
  let children = []
  const node = {
    key: nodePath,
    type: typeof (jsonNode),
    children: children
  }

  if (Array.isArray(jsonNode)) {
    node.type = 'array'
    node.header = 'array'
    children.push(...jsonNode.map((arrayNode, index) => ({
        title: `[${index}]`,
        header: 'array-item',
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
    node.children.push({
      header: node.type === 'array' ? 'end-array' : 'end-object'
    })
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

if (props.data) {
  updateJsonTree(props.data)
}

</script>
