import { defineStore } from 'pinia'
import { uiApi } from 'boot/axios'
import useSettingsStore from 'stores/settings'
import { reactive } from 'vue'
import SwaggerClient from 'swagger-client'
import useUserstateStore from 'stores/userstate'
import { Notify } from 'quasar'

import localforage from 'localforage'

const fs = localforage.createInstance({
  name: 'openapi-ui',
  storeName: 'openapi-cache'
})

function applyDefaults (spec) {
  if (!spec.servers) {
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
        if (!specUrl) {
          return Promise.reject()
        }
      }
      console.log('loadSpec', specName, specUrl)
      const swaggerClient = new SwaggerClient(specUrl)

      return fs.getItem(specName)
        .then(cached => {
          if (cached) {
            if (!cached.$$cacheExpires) {
              const cacheExpiresDate = new Date()
              cacheExpiresDate.setHours(cacheExpiresDate.getHours() + 1)
              cached.$$cacheExpires = cacheExpiresDate

              return fs
                .setItem(specName, cached)
                .then(() => cached)
                .then(cached => swaggerClient.resolve({ url: specUrl, spec: cached }))
            }

            if (cached.$$cacheExpires.getTime() > new Date().getTime()) {
              return swaggerClient.resolve({ url: specUrl, spec: cached })
            }
          }

          SwaggerClient.clearCache()
          return SwaggerClient.resolve({
            url: specUrl,
            userFetch: (url, req) => SwaggerClient.http(url, {
              ...req,
              mode: 'no-cors'
            })
          })
            .then(swagger => {
              if (!swagger) {
                throw new Error('Failed to load swagger :(')
              }
              swagger.spec.$$name = specName
              swagger.spec.$$url = specUrl
              applyDefaults(swagger.spec)
              operationPaths(swagger.spec)
              return swagger
            })
            .then(swagger => {
              const cached = JSON.parse(JSON.stringify(swagger))
              const cacheExpiresDate = new Date()
              cacheExpiresDate.setHours(cacheExpiresDate.getHours() + 1)
              cached.$$cacheExpires = cacheExpiresDate

              return fs
                .setItem(specName, cached.originalSpec)
                .then(() => swagger)
            })
            .catch((err) => {
            })
        })
        .then(swagger => {
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
export default useOpenapiStore
