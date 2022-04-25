<template>
<span></span>
</template>

<script setup>

import useOauth from 'src/services/Oauth'
import { onMounted } from 'vue'

const oauth = useOauth();

onMounted(() => {
  oauth.callback();
})

</script>

<style scoped>

</style>
