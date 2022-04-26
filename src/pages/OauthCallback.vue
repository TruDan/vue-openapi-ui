<template>
<span></span>
</template>

<script setup>

import useOauth from 'src/services/Oauth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const oauth = useOauth();
const router = useRouter();

onMounted(() => {
  oauth.callback().then(({user, redirectUrl}) => {
    router.replace(redirectUrl ?? '/');
  });
})

</script>

<style scoped>

</style>
