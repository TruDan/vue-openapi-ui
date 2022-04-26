import { defineStore } from 'pinia'
import { uiApi } from 'boot/axios'
import useSettingsStore from 'stores/settings'
import { reactive } from 'vue'
import SwaggerClient from 'swagger-client'
import useUserstateStore from 'stores/userstate'
import { Notify } from 'quasar'

function applyDefaults (spec) {
  if(!spec.servers) {
    spec.servers = [
      {
        url: new URL(spec.$$url).origin
      }
    ]
  }
  return spec
}
function operationPaths (spec) {
  if (spec.paths) {
    for (const [pathKey, pathValue] of Object.entries(spec.paths)) {
      for (const [operationKey, operationValue] of Object.entries(pathValue)) {
        operationValue.$$path = pathKey
        operationValue.$$operation = operationKey
      }
    }
  }
  return spec
}

const useOpenapiStore = defineStore({
  id: 'openapi',
  state: () => ({
    mergedSpec: {},
    specs: {}
  }),
  getters: {
    /**
     * @param state
     * @returns {function(string): OpenApi}
     */
    getSpec (state) {
      return (specName) => state.specs[specName]?.spec
    }
  },
  actions: {
    loadSpec (specName, specUrl) {
      if (this.specs[specName]) {
        return Promise.resolve(this.specs[specName]?.spec)
      }

      if (!specUrl) {
        const settings = useSettingsStore()
        const matchingSpec = settings.findSpec(specName)
        if (matchingSpec) {
          specUrl = matchingSpec.url
        }
      }

      // return uiApi.get(specUrl)
      //   .then(response => {
      //     if (response.status === 200 && response.data) {
      //       return SwaggerClient.resolve({
      //         spec: response.data,
      //         url: specUrl
      //       })
      //     }
      //     throw new Error(`Invalid spec file from '${specUrl}'`)
      //   })
      return SwaggerClient.resolve({
        url: specUrl
      })
        .then(swagger => {
          swagger.spec.$$name = specName;
          swagger.spec.$$url = specUrl;
          applyDefaults(swagger.spec);
          operationPaths(swagger.spec);

          this.$patch({
            specs: {
              [specName]: swagger
            }
          })
          return this.specs[specName]?.spec
        })
    },
    executeOperation (spec, operationId, parameters) {
      const userstate = useUserstateStore()
      const execution = userstate.createTryModeExecution(spec.$$name, operationId)

      execution.error = undefined
      execution.response = undefined
      execution.loading = true

      return new Promise((resolve, reject) => {
        try {
          SwaggerClient.execute({
            spec: spec,
            operationId: operationId,
            parameters: parameters,
            securities: userstate.securities
          })
            .then(response => {
              resolve(response)
            })
            .catch(error => {
              Notify.create({
                color: 'negative',
                textColor: 'white',
                icon: 'warning',
                message: `${error}`
              })
              reject(error)
            })
        } catch (error) {
          Notify.create({
            color: 'negative',
            textColor: 'white',
            icon: 'warning',
            message: `${error}`
          })
          reject(error)
        }
      }).then(response => {
        execution.response = response
        execution.status = error.status
        execution.statusCode = error.statusCode
        execution.loading = false
      }).catch(error => {
        execution.response = error.response
        execution.error = `${error.name} - ${error.message}`
        execution.status = error.status
        execution.statusCode = error.statusCode
      })
    }

  }
})
export default useOpenapiStore;
