<template>
  <router-view :key="route.params.spec"/>
</template>

<script setup>
import useOpenapiStore from 'stores/openapi'
import { useRoute } from 'vue-router'
import { provide, ref, watch } from 'vue'

const route = useRoute()
const openapi = useOpenapiStore()

const spec = ref(null)

provide('spec', spec)

watch(route, (newRoute) => {
  openapi.loadSpec(decodeURIComponent(newRoute.params.spec)).then(s => spec.value = s);
})
openapi.loadSpec(decodeURIComponent(route.params.spec)).then(s => spec.value = s);
</script>

<style scoped>

</style>
