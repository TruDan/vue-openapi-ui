import { defineStore } from 'pinia'
import { uiApi } from 'boot/axios'
import { useSettingsStore } from 'stores/settings'
import { reactive } from 'vue'

function deepGet (obj, path, separator = '/') {
  const paths = path.split(separator)
  let current = obj
  let i

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return undefined
    } else {
      current = current[paths[i]]
    }
  }

  return current
}

function deepWalkForProperty (obj, targetPropName, cb, parentObj, keyInParent, rootObj) {
  if (parentObj === undefined) {
    parentObj = obj
  }

  if (rootObj === undefined) {
    rootObj = parentObj || obj
  }

  if (typeof (obj) === 'object') {
    if (obj.hasOwnProperty(targetPropName)) {
      cb({
        value: obj[targetPropName],
        target: obj,
        parent: parentObj,
        keyInParent: keyInParent,
        root: rootObj
      })

      return
    }

    for (const k of Object.keys(obj)) {
      deepWalkForProperty(obj[k], targetPropName, cb, obj, k, rootObj)
    }
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      deepWalkForProperty(obj[i], targetPropName, cb, obj, i, rootObj)
    }
  }
}

const refEx = /^#\/(?<path>[\w\/]+)$/si

function processSpecRefs (specRaw) {
  const spec = reactive(specRaw)

  if (spec.components) {

    for (const component of Object.keys(spec.components)) {
      if(typeof(spec.components[component]) === 'object') {
        for (const k of Object.keys(spec.components[component])) {
          const cObj = spec.components[component][k];
          if(!cObj.hasOwnProperty("$path")) {
            cObj['$path'] = `/components/${component}/${k}`;
          }
          if(!cObj.hasOwnProperty('$title')) {
            cObj['$title'] = cObj['title'] || k;
          }
        }
      }
    }
  }

  deepWalkForProperty(spec, '$ref', ({
    value,
    target,
    parent,
    keyInParent,
    root
  }) => {
    if (typeof (value) !== 'string') return
    const match = refEx.exec(value)
    if (match && match.groups && match.groups.path) {
      const newValue = deepGet(root, match.groups.path, '/')
      if (newValue) {
        parent[keyInParent] = newValue
      }
    }
  })

  return spec
}

export const useOpenapiStore = defineStore('openapi', {
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
      return (specName) => state.specs[specName]
    }
  },
  actions: {
    loadSpec (specName, specUrl) {
      if (this.specs[specName]) {
        return Promise.resolve(this.specs[specName])
      }

      if (!specUrl) {
        const settings = useSettingsStore()
        const matchingSpec = settings.findSpec(specName)
        if (matchingSpec) {
          specUrl = matchingSpec.url
        }
      }

      return uiApi.get(specUrl).then(response => {
        if (response.status === 200 && response.data) {
          const spec = processSpecRefs(response.data)

          console.log('loaded ', specName, specUrl, spec)
          this.$patch({
            specs: {
              [specName]: spec
            }
          })
          return this.specs[specName]
        }
        throw new Error(`Invalid spec file from '${specUrl}'`)
      })
    }
  }
})
