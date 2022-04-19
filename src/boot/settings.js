import {boot} from 'quasar/wrappers'
import {useSettingsStore} from "stores/settings";
import {setCssVar, Dark} from 'quasar'
import { useUserstateStore } from 'stores/userstate'

const themeVariableWhitelist = [
  'primary',
  'secondary',
  'accent',
  'dark',
  'positive',
  'negative',
  'info',
  'warning',
]

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async () => {
  const settings = useSettingsStore();

  settings.$subscribe((mutation, state) => {
    if (state.ui) {
      if (state.ui.theme) {
        for (const [key, value] of Object.entries(state.ui.theme)) {
          setCssVar(key, value?.toString() || '');
        }
      }

      if (state.ui.dark) {
        Dark.set(state.ui.dark);
      }
    }
  });

  settings.load();

  const userstate = useUserstateStore();
  userstate.$subscribe((mutation, state) => {

    if(settings.ui.darkToggle) {
      if (state.dark !== undefined) {
        Dark.set(state.dark);
      }
    }
    else {
      Dark.set(settings.ui.dark);
    }
  });
})
