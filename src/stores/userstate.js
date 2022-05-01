import { defineStore } from 'pinia'
import { uiApi } from 'boot/axios'
import route from 'src/router'
import { useRouter } from 'vue-router'

const useUserstateStore = defineStore({
  id: 'userstate',
  state: () => ({
    navigation: {
      expanded: [],
      groupMode: 'tree'
    },
    tryMode: false,
    debugMode: false,
    dark: undefined,
    tryModeExecutions: {},
    securities: {
      authorized: {},
      oauth: {
        authenticated: false,
        access_token: undefined,
        refresh_token: undefined,
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
    },
    setOauthUser(user) {
      this.securities.oauth = {
        ...user,
        ...{
          redirectUrl: this.securities.oauth.redirectUrl
        }
      };
      if(user) {
        this.securities.authorized.oauth2 = {
          ...user,
          token: {
            access_token: user.access_token,
            id_token: user.id_token,
            refresh_token: user.refresh_token,
            token_type: user.token_type,
            expires_at: user.expires_at,
            scopes: user.scopes,
            scope: user.scope,
          },
          name: 'oauth2',
          scopes: user.scopes
        }
      }
    }
  }
})
export default useUserstateStore;
