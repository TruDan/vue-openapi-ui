<template>
  <router-view/>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useSettingsStore } from 'stores/settings'

const $q = useQuasar()
const settings = useSettingsStore()

function maybePrefixMdi (iconName) {
  if ($q.iconSet.name.startsWith('mdi-')) {
    if (!iconName.startsWith('mdi-')) {
      return {
        icon: `mdi-${iconName}`
      }
    }
  }

  return { icon: iconName }
}

$q.iconMapFn = (iconName) => {

  const icon = settings.getIcon(iconName)
  if (icon !== void 0) {
    return maybePrefixMdi(icon);
  }

  return maybePrefixMdi(iconName);
}
</script>
