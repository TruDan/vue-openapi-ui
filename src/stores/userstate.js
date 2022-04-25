import { defineStore } from 'pinia'
import { uiApi } from 'boot/axios'

export const useUserstateStore = defineStore('userstate', {
  state: () => ({
    navigation: {
      expanded: []
    },
    tryMode: false,
    debugMode: false,
    dark: undefined,
    tryModeExecutions: {},
    securities: { authorized: {} }
  }),
  getters: {
    getTryModeExecution (state) {
      return (specName, operationId) => state.tryModeExecutions[`${specName}$$${operationId}`]
    }
  },
  actions: {
    createTryModeExecution (specName, operationId) {
      const key = `${specName}$$${operationId}`
      if (!this.tryModeExecutions[key]) {
        this.tryModeExecutions[key] = {
          state: {},
          response: null,
          error: null,
          status: null,
          statusCode: null,
          loading: false
        }
      }
      return this.tryModeExecutions[key];
    }
  }
})
