<template>
  <div class="jv-container" v-if="schemaTree" ref="root">
    <q-tree tick-strategy="none"
            class="jsonschematree jv-code"
            default-expand-all
            :nodes="schemaTree"
            node-key="key"
            label-key="title"
            :duration="0"
    >

      <template #default-header="{ node, expanded }">
        <div class="jv-node"
             :data-key="node.key"
             :data-expanded="expanded"
             :data-type="node.type">
          <div class="row items-center">
            <div class="text-no-wrap text-weight-bold jv-key">
              <code>{{ node.title || node.$title }}</code>
            </div>
            <div class="text-caption q-ml-sm">
              <em>
                <span :class="`jv-item jv-${node.type}`">
                  {{ node.typeTitle || node.type }}
                </span>
                <span v-if="node.innerType" :class="`jv-item jv-${node.innerType}`">
                  [<span :class="`jv-item jv-${node.innerType}`">{{ node.innerTypeTitle || node.innerType }}</span>]
                </span>
              </em>
            </div>
          </div>
          <div class="row items-center" v-if="node.description">
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
import { defineProps, onMounted, onUpdated, ref, watch, nextTick } from 'vue'

const root = ref(null)

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
})

const schemaTree = ref([])

function handleNodeClick (node) {

  const el = root.value.querySelector(`[data-key="${node.key.replace(/[\[\]\"]+/g, '\\$1')}"]`)
   nextTick(() => updateNodeClasses(el));
}

function updateNodeClasses (e) {
  const tn = e.closest('.q-tree__node');
  tn.classList.toggle('q-tree__node--expanded', (e.dataset.expanded === 'true'))
  for(const key of tn.classList.keys()) {
    if(/^jv-/.test(key)) {
      tn.classList.remove(key);
    }
  }
  tn.classList.add(`jv-${e.dataset.type}`)
}
function updateClasses () {
  if (root.value) {
    root.value.querySelectorAll('[data-expanded]').forEach(e => {
      updateNodeClasses(e);
    })
  }
}

function schemaNodeToTreeNode (schemaNode, nodePath) {
  let children = []
  const node = {
    key: nodePath,
    type: schemaNode.type,
    typeTitle: schemaNode.title || schemaNode.$title || schemaNode.type,
    children: children
  }

  if (schemaNode.type === 'array') {
    node.type = 'array'
    node.header = 'array'
    if (schemaNode.items) {

      const inner = schemaNodeToTreeNode(schemaNode.items, [nodePath, 'items'].join('.'))
      node.innerType = inner.type
      node.innerTypeTitle = inner.typeTitle
      if (inner.children) {
        children.push(...inner.children)
      }
    }
  } else if (schemaNode.type === 'object') {
    if (schemaNode.properties) {
      children.push(...Object.entries(schemaNode.properties).map(([propertyKey, propertyNode]) => ({
          title: propertyKey,
          ...schemaNodeToTreeNode(propertyNode, [nodePath, 'properties', propertyKey].join('.'))
        })
      ))
    }
  }

  if (children.length) {
    node.handler = handleNodeClick
  } else {
    node.children = undefined
  }
  return node
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

onMounted(() => {
  updateClasses()
})

onUpdated(() => {
  updateClasses()
})

if (props.schema) {
  updateSchemaTree(props.schema)
}

</script>
