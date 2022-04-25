import { defineStore } from 'pinia'
import { uiApi } from 'boot/axios'
import route from 'src/router'
import { useRouter } from 'vue-router'

const useUserstateStore = defineStore({
  id: 'userstate',
  state: () => ({
    navigation: {
      expanded: []
    },
    tryMode: false,
    debugMode: false,
    dark: undefined,
    tryModeExecutions: {},
    securities: {
      authorized: {},
      oauth: {
        authenticated: false,
        accessToken: undefined,
        refreshToken: undefined,
        redirectUrl: undefined,
        profile: {
          avatar: undefined,
          name: undefined
        }
      }
    }
  }),
  getters: {
    getTryModeExecution (state) {
      return (specName, operationId) => state.tryModeExecutions[`${specName}$$${operationId}`]
    },
    getOauthUser(state) {
      return state.securities.oauth;
    },
    getAuthCallbackLocation(state) {
       return this.securities.oauth.redirectUrl;
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
    },
    setAuthCallbackLocation() {
      this.securities.oauth.redirectUrl = route.fullPath;
    }
  }
})
export default useUserstateStore;
