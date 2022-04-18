<template>
  <div class="jv-container" v-if="schemaTree">
    <q-tree tick-strategy="none"
            class="jsonschematree jv-code"
            default-expand-all
            :nodes="schemaTree"
            node-key="key"
            label-key="title"
    >

      <template #default-header="{ node }">
        <div class="jv-node">
          <div class="row items-center">
            <div class="text-no-wrap text-weight-bold jv-key">
              <code>{{ node.title || node.$title }}</code>
            </div>
            <div class="text-caption q-ml-sm">
              <em>
                <span v-if="node.wrapperNode" :class="`jv-item jv-${node.wrapperNode.type}`">
                  {{ node.wrapperNode.type }}[<span :class="`jv-item jv-${node.type}`">{{ node.type }}</span>]
                </span>
                <span v-else :class="`jv-item jv-${node.type}`">
                  {{ node.type }}
                </span>
              </em>
            </div>
          </div>
          <div class="row items-center">
            <div class="text-caption">
              {{ node.description }}
            </div>
          </div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue'

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
})

const schemaTree = ref([])

function schemaNodeToTreeNode (schemaNode, nodePath) {
  let children = []

  if (schemaNode.type === 'array') {
    return ({
      header: 'array',
      wrapperNode: schemaNode,
      ...schemaNodeToTreeNode(schemaNode.items, [nodePath, 'items'].join('.'))
    })
  } else if (schemaNode.type === 'object') {
    if(schemaNode.properties) {
      children.push(...Object.entries(schemaNode.properties).map(([propertyKey, propertyNode]) => ({
          title: propertyKey,
          ...schemaNodeToTreeNode(propertyNode, [nodePath, 'properties', propertyKey].join('.'))
        })
      ))
    }
  }

  return ({
    key: nodePath,
    children: children.length ? children : undefined,
    ...schemaNode
  })
}

function updateSchemaTree (schema) {
  schemaTree.value = [schemaNodeToTreeNode(schema, 'root')]
}

watch(() => props.schema, (schema) => {
  updateSchemaTree(schema)
}, {
  deep: true
})

if (props.schema) {
  updateSchemaTree(props.schema)
}

</script>
