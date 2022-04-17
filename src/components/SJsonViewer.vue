<template>
  <div class="jv-container" v-if="jsonTree">
    <q-tree tick-strategy="none"
            class="jsontree jv-code"
            default-expand-all
            :nodes="jsonTree"
            node-key="key"
            label-key="title"
    >

      <template #default-header="{ node }">
        <div class="jv-node">
          <div class="row items-center">
            <div class="text-no-wrap text-weight-bold jv-key">{{ node.title || node.$title }}</div>
            :
            <div class="text-caption q-ml-sm jv-item" :class="`jv-${node.type}`">{{ node.value }}</div>
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
    type: typeof(jsonNode),
    children: children
  };

  if (Array.isArray(jsonNode)) {
    node.type = 'array'
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
  }
  else if(node.type === 'string') {
    node.value = `"${jsonNode}"`
  }
  else {
    node.value = jsonNode;
  }

  if(!children.length)
    node.children = undefined

  return node;
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
