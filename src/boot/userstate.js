import { boot } from 'quasar/wrappers'
import { useUserstateStore } from 'stores/userstate'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async () => {
  const userstate = useUserstateStore();

  const currentUserstate = localStorage.getItem('userstate');
  if(currentUserstate) {
    try {
      const state = JSON.parse(currentUserstate);
      if(state) {
        userstate.$patch(state);
      }
      else throw new Error("Invalid state persisted to localstorage, resetting..");
    }
    catch(e) {
      localStorage.removeItem('userstate');
      userstate.$reset();
    }
  }

  userstate.$subscribe((mutation, state) => {
    localStorage.setItem('userstate', JSON.stringify(state));
  });
})
