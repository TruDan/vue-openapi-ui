<template>
  <q-layout view="hhh lpR lFr">
    <q-header reveal elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ settings.ui.title }}
        </q-toolbar-title>

        <div>
          <q-icon name="theme-light-dark"
                  size="sm"
          />
          <q-toggle v-model="dark"
                    toggle-indeterminate
                    indeterminate-value="auto"
                    toggle-order="ft"
                    color="secondary"
                    keep-color>
            <q-tooltip anchor="bottom middle"
                       self="top middle">
              {{ darkLabel }}
            </q-tooltip>
          </q-toggle>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered
              :width="drawerWidth"
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <SNavigation/>
      </q-list>
    </q-drawer>
    <teleport to="aside" v-if="mountDrawer">
      <s-resize-handle v-model="drawerWidth" />
    </teleport>

    <q-page-container>
      <div ref="scrollTopHelper" class="hidden"></div>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { computed, ref, watch, Teleport, onMounted, nextTick } from 'vue'
import SNavigation from 'components/SNavigation'
import { useSettingsStore } from 'stores/settings'
import { useUserstateStore } from 'stores/userstate'
import { useRoute } from 'vue-router'
import { Dark, scroll } from 'quasar'
import SResizeHandle from 'components/SResizeHandle'

const {
  getScrollTarget,
  setVerticalScrollPosition
} = scroll

function scrollToElement (el, duration) {
  if (duration === undefined) {
    duration = 250
  }

  const target = getScrollTarget(el)
  const offset = el.offsetTop
  setVerticalScrollPosition(target, offset, duration)
}

const settings = useSettingsStore()
const userstate = useUserstateStore()
const route = useRoute()

const scrollTopHelper = ref(null)

const leftDrawerOpen = ref(false)
const mountDrawer = ref(false)
const drawerWidth = ref(250)
const split = ref(15)

const dark = computed({
  get: () => Dark.mode,
  set: (value) => Dark.set(value)
})

const darkLabel = computed(() => dark.value === true
  ? 'Dark'
  : (dark.value === false
    ? 'Light'
    : 'Automatic')
)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

watch(() => route.fullPath, (oldRoute, newRoute) => {
  if (oldRoute !== newRoute) {
    if (scrollTopHelper.value) {
      scrollToElement(scrollTopHelper.value)
    }
  }
}, {
  deep: true
})

onMounted(() => {
  nextTick(() => {
    mountDrawer.value = true
  })
})

</script>
