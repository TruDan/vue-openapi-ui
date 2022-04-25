import { defineStore } from 'pinia'
import { uiApi } from 'boot/axios'
import useOauth from 'src/services/Oauth'

const useSettingsStore = defineStore('settings', {
  state: () => ({
    ui: {
      title: 'Default Title',
      theme: {
        primary: null,
        secondary: null
      },
      dark: false,
      darkToggle: true,
      specs: [],
      icons: {
        'folder-closed': 'mdi-folder',
        'folder-open': 'mdi-folder-open',
        'folder-root': 'mdi-server'
      }
    }
  }),
  getters: {
    findSpec (state) {
      return (specName) => state.ui.specs.find(x => x.id === specName || x.name === specName)
    },
    getIcon (state) {
      return (iconName) => state.ui.icons && state.ui.icons[iconName] || undefined
    }
  },
  actions: {
    load () {
      fetch(process.env.VUE_APP_UI_SETTINGS_PATH)
        .then(response => response.json())
        .then(settings => {
          if (settings) {

            if (settings.specs && Array.isArray(settings.specs)) {
              settings.specs = settings.specs.map(s => ({
                ...s,
                id: s.id || s.name
              }))
            }

            if(settings.authorization?.oauth2) {
              const oauth = useOauth();
              oauth.init(settings.authorization.oauth2);
            }

            this.$reset()
            this.$patch({
              ui: settings
            })
          }
        })
    }
  }
})
export default useSettingsStore
