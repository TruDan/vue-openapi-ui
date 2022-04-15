import { defineStore } from 'pinia'
import { uiApi } from 'boot/axios'

export const useUserstateStore = defineStore('userstate', {
  state: () => ({
    navigation: {
      expanded: []
    }
  }),
  getters: {},
  actions: {
    load () {
      uiApi.get('ui.json').then(response => {
        if (response.status === 200) {
          this.ui = response.data
        }
      })
    }
  }
})
