<template>


  <div class="row no-wrap items-center s-navigation-toolbar s-navigation-toolbar__filled">

    <q-input class="q-ma-sm col"
             v-model="filter"
             placeholder="Filter..."
             dense
             rounded
             borderless
             type="search"
    >
      <template #prepend>
        <q-icon name="magnify" size="xs"></q-icon>
      </template>
      <template v-if="filter" #append>
        <q-icon name="close"
                size="xs"
                @click.stop="filter = null"
                class="cursor-pointer"/>
      </template>
    </q-input>
    <div>
      <q-btn dense
             flat
             stretch
             padding="xs"
             size="sm"
             icon="arrow-expand-vertical"
             @click.passive="$refs.treeNavigation.expandAll()"
      />
      <q-tooltip anchor="top middle"
                 self="bottom middle"
                 transition-show="fade"
                 transition-hide="fade"
                 :offset="[0,4]"
      >
        Expand All nodes
      </q-tooltip>
    </div>
    <div>
      <q-btn dense
             flat
             stretch
             padding="xs"
             size="sm"
             icon="arrow-collapse-vertical"
             @click.passive="$refs.treeNavigation.collapseAll()"
      />
      <q-tooltip anchor="top middle"
                 self="bottom middle"
                 transition-show="fade"
                 transition-hide="fade"
                 :offset="[0,4]"
      >
        Collapse All nodes
      </q-tooltip>
    </div>
    <div>
      <q-btn dense
             flat
             stretch
             padding="xs"
             size="sm"
             unelevated
             icon="dots-horizontal">
        <q-menu>
          <q-list dense>
            <div class="text-subtitle1">Group By...</div>
            <q-item clickable @click="userstate.navigation.groupMode = 'tree'">Tree</q-item>
            <q-item clickable @click="userstate.navigation.groupMode = 'tags'">Tags</q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-tooltip anchor="top middle"
                 self="bottom middle"
                 transition-show="fade"
                 transition-hide="fade"
                 :offset="[0,4]"
      >
        Group By
      </q-tooltip>
    </div>
  </div>

  <q-tree ref="treeNavigation"
          :nodes="nodes"
          :filter="filter"
          v-model:expanded="userstate.navigation.expanded"

          node-key="key"
          @lazy-load="onLazyLoad"
          tick-strategy="none"
          no-connectors
          dense
          class="s-navigation non-selectable"

  >
    <template #header-api="{ node }">
      <q-item dense>
        <q-item-section avatar v-if="node.avatar">
          <q-avatar>
            <q-img :src="node.avatar"/>
          </q-avatar>
        </q-item-section>
        <q-item-section side v-else-if="node.icon">
          <q-avatar>
            <q-icon
              :name="((!node.icon && node.children) || node.icon === 'folder')
                      ? (expanded
                        ? 'folder-open'
                        : 'folder-closed')
                      : node.icon"
            />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          {{ node.label }}
        </q-item-section>
      </q-item>
    </template>

    <template #default-header="{ node, expanded }">
      <q-item dense>
        <q-item-section side>
          <q-avatar>
            <q-icon
              :name="((!node.icon && node.children) || node.icon === 'folder')
                      ? (expanded
                        ? 'folder-open'
                        : 'folder-closed')
                      : node.icon"
            />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          {{ node.label }}
        </q-item-section>
      </q-item>
    </template>

    <template #header-operation="{ node }">
      <q-item dense
              class="full-width"
              :to="node.to"
      >
        <q-item-section>
          {{ node.label }}
        </q-item-section>
        <q-item-section side>
          <s-operation-badge :operation="node.operation" text/>
        </q-item-section>
      </q-item>
    </template>

  </q-tree>
</template>

<script setup>

import { computed, onMounted, ref, watch } from 'vue'
import useSettingsStore from 'stores/settings'
import useOpenapiStore from 'stores/openapi'
import useUserstateStore from 'stores/userstate'
import SOperationBadge from 'components/SOperationBadge'

const settings = useSettingsStore()
const openapi = useOpenapiStore()
const userstate = useUserstateStore()
const filter = ref('')
const treeNavigation = ref(null)
const nodes = ref([])

const trimEx = /^[\/]*/ius

function cleanupNode (node) {
  return ({
    ...node,
    label: node.label ? node.label.replace(trimEx, '') : undefined
  })
}

function specToTree ({ paths }, specId) {
  const pathTree = {}
  for (const [key, value] of Object.entries(paths)) {
    if (/^__.*/.test(key)) {
      continue
    }

    const segments = key.split('/')
    let last = pathTree

    for (const segment of segments) {
      if (!last[segment]) {
        last[segment] = {}
      }
      last = last[segment]
    }

    last['__value'] = {
      ...value,
      path: key,
      specId
    }
  }
  return pathTree
}

function specToTags({paths}, specId) {
  const taggedNodes = {}
  const untaggedNodes = []

  for (const [key, value] of Object.entries(paths)) {
    for (const [operationKey, operationValue] of Object.entries(value)) {
      const tags = operationValue.tags;
      const n = cleanupNode({
        key: `${key}@${operationKey}`,
        path: key,
        label: operationValue.operationId || operationValue.description || operationValue.summary || operationKey,
        operation: operationKey,
        pathSpec: operationValue,
        header: `operation`,
        specId: specId,
      })
      n.to = `/${n.specId}/${n.operation}$${n.path}`

      if(!tags) {
        untaggedNodes.push(n);
      }
      else {
        for(const tag of tags) {
          if(!taggedNodes[tag]) {
            taggedNodes[tag] = [];
          }
          taggedNodes[tag].push(n);
        }
      }
    }
  }

  return [
    ...Object.entries(taggedNodes).map(([tag, nodes]) => ({
      key: tag,
      label: tag,
      children: nodes
    })),
    ...untaggedNodes
  ]
}

function treeToNodes (tree, parentItem = {}) {
  const relativePath = parentItem.relativePath || ''
  const nodes = []
  for (const [key, value] of Object.entries(tree)) {
    const node = {
      key: [relativePath, key].join('/'),
      relativePath: [relativePath, key].join('/'),
      label: key,
      specId: value.specId || parentItem.specId
    }
    if (/^__value/.test(key)) {
      nodes.push(...Object.entries(value)
        .filter(([k, v]) => (!(['specId', 'path'].includes(k))))
        .map(([k, v]) => {
          const n = cleanupNode({
            key: `${relativePath}@${k}`,
            path: v.path || value.path || parentItem.path || `${relativePath}`,
            label: v.operationId || v.description || v.summary || k,
            operation: k,
            pathSpec: v,
            header: `operation`,
            specId: v.specId || value.specId || parentItem.specId,
          })
          n.to = `/${n.specId}/${n.operation}$${n.path}`
          return n
        })
      )
      continue
    }

    const children = treeToNodes(value, node)
    if (children.length === 1 && children[0].relativePath) {
      nodes.push(cleanupNode({
        ...children[0],
        label: [node.label, children[0].label].join('/'),
        key: `${children[0].key}`
      }))
      continue
    }

    nodes.push({
      ...cleanupNode(node),
      children
    })
  }

  if (nodes.length === 1 && nodes[0].children) {
    const node = nodes[0]
    return node.children.map(child => cleanupNode({
      ...child,
      label: [node.label, child.label].join('/')
    }))
  }

  return nodes
}

function specToNodes (spec, specId) {
  if (userstate.navigation.groupMode === 'tags') {
    return specToTags(spec, specId);
  } else {
    return treeToNodes(specToTree(spec, specId))
  }
}

function loadSpecs (specs) {
  nodes.value = specs.map(spec => {
    let children = undefined

    const spec2 = openapi.getSpec(spec.id)
    if (spec2) {
      children = specToNodes(spec2, spec.id)
    }

    return ({
      label: spec.name,
      icon: 'folder-root',
      key: spec.id,
      specId: spec.id,
      ...spec,
      lazy: true,
      header: 'api',
      children: children
    })
  })
}

watch(() => settings.ui.specs, (specs) => {
  loadSpecs(specs)
}, {
  deep: true
})

watch(() => userstate.navigation.groupMode, groupMode => {
  loadExpandedSpecs(userstate.navigation.expanded)
})

function loadExpandedSpecs (expanded) {
  if (!expanded) return
  const specNames = expanded.filter(x => !/^\//.test(x))
  specNames
    .map(specName => openapi
      .loadSpec(specName)
      .then(spec => {
        const node = treeNavigation.value.getNodeByKey(specName)
        if (node) {
          node.children = specToNodes(spec, specName)
        }
      }))
}

onMounted(() => {
  if (settings.ui.specs) {
    loadSpecs(settings.ui.specs)
  }
  if (userstate.navigation.expanded) {
    loadExpandedSpecs(userstate.navigation.expanded)
  }
})

function onLazyLoad ({
  node,
  key,
  done,
  fail
}) {
  return openapi.loadSpec(key, node.url).then(spec => {
    const children = specToNodes(spec, key)
    done(children)
  })
    .catch((err) => {
      fail()
    })
}

</script>

<style lang="scss">
$q-tree-font-size: 0.875rem;
$q-tree-icon-size: 1.125rem;

.s-navigation {

  &.q-tree {
    /* Nested Items */
    &.q-tree--dense {
      font-size: $q-tree-font-size;

      .q-tree__children {
        margin-left: 0.5rem;
        padding-left: 0;
        overflow-x: hidden;

        .q-tree__node--child {
          padding-left: 0.5rem;
        }

      }

      &:not(.q-tree--no-connectors) {
        &::before {
          content: '';
          display: inline-block;;
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          bottom: 0;
          width: 1px;
          opacity: 0.35;
          background: currentColor;

          transition: opacity linear .2s;
        }

        &:hover {
          &::before {
            opacity: 0.5;
          }
        }
      }
    }

    /* Items */
    .q-tree__node {

      .q-list--dense > .q-item,
      .q-item--dense {
        min-height: 1.5rem;
        padding: 0;
      }

      &-header {
        border-radius: 0;

        > .q-tree__node-header-content {
          white-space: nowrap;
        }

        > .q-tree__arrow, > .q-spinner {
          order: 10;
        }
      }

      .q-item__section--side {
        padding-right: 0.5rem;
      }
    }

    /* Avatars / Icons */
    .q-tree__avatar,
    .q-tree__node-header-content {
      .q-avatar {
        min-width: $q-tree-icon-size;
        height: $q-tree-icon-size;
        border-radius: 0;
      }

      .q-icon {
        font-size: $q-tree-icon-size;
      }

      .operation-badge {
        font-size: $q-tree-icon-size;
        display: inline-block;
        width: auto;
        padding: 0;
        text-align: right;

        > .q-avatar__content {
          font-size: 0.625rem;
          font-weight: 900;
          letter-spacing: 0.5pt;
          width: auto;
          text-align: right;
        }
      }

    }

    .q-icon.mdi {
      &.mdi-folder,
      &.mdi-folder-open {
        color: var(--q-accent);
      }
    }

    a:any-link, a:link, a:visited {
      text-decoration: none !important;
    }
  }

}
</style>
