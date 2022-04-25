<template>
  <q-item clickable @click.stop="onClick">
    <template v-if="user">
      <q-item-section avatar>
        <q-avatar>
          <q-img v-if="user.profile.avatar" :src="user.profile.avatar"/>
          <q-icon v-else name="account-circle"/>
        </q-avatar>
      </q-item-section>
      <q-item-section>
        {{ user.profile.name }}
      </q-item-section>
    </template>
    <template v-else>
      <q-item-section side class="q-pr-sm text-white">
          <q-icon name="account-circle"/>
      </q-item-section>
      <q-item-section no-wrap>
        <q-item-label>Sign In</q-item-label>
      </q-item-section>
    </template>
  </q-item>
</template>

<script setup>

import useUserstateStore from 'stores/userstate'
import useOauth from 'src/services/Oauth'

const oauth = useOauth();
const userstate = useUserstateStore()

const user = oauth.user

function onClick() {
  if(user.value) {
    // signout
    oauth.logout()
  }
  else {
    // signin
    oauth.login()
  }
}
</script>
