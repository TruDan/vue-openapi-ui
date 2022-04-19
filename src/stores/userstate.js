import { defineStore } from 'pinia'
import { uiApi } from 'boot/axios'

export const useUserstateStore = defineStore('userstate', {
  state: () => ({
    navigation: {
      expanded: []
    },
    tryMode: false,
    debugMode: false,
    dark: undefined
  }),
  getters: {},
  actions: {}
})
