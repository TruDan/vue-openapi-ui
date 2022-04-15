import { defineStore } from 'pinia'
import { uiApi } from 'boot/axios'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    ui: {
      title: "Default Title",
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
    findSpec(state) {
      return (specName) => state.ui.specs.find(x => x.name === specName);
    },
    getIcon(state) {
      return (iconName) => state.ui.icons && state.ui.icons[iconName] || undefined;
    }
  },
  actions: {
    load () {
      uiApi.get('ui.json').then(response => {
        if (response.status === 200) {
          this.$reset();
          this.$patch({
            ui:  response.data
          });
        }
      })
    }
  }
})
