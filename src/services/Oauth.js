import { UserManager } from 'oidc-client'
import { ref, toRaw } from 'vue'
import useUserstateStore from 'stores/userstate'
import { useRouter } from 'vue-router'
import { Router } from 'src/router'

class Oauth {

  static #defaultOptions = {
    automaticSilentRenew: true,
    redirect_uri: '/'
  }

  #userManager = undefined
  #user = ref(null)
  #authenticated = ref(false)

  get user () {
    return toRaw(this.#user)
  }

  get authenticated () {
    return toRaw(this.#authenticated)
  }

  constructor () {

  }

  init (options) {;
    const cb = Router.resolve({ name: 'oidc-callback' });
console.log(cb);
    this.#userManager = new UserManager(Object.assign({}, Oauth.#defaultOptions, {
      redirect_uri: new URL(cb.href, window.origin).toString()
    }, options))
    this.#userManager.events.addUserLoaded(this.#onUserLoaded.bind(this))
    this.#userManager.events.addUserUnloaded(this.#onUserUnloaded.bind(this))
    this.#userManager.events.addSilentRenewError(this.#onSilentRenewError.bind(this))
    this.#userManager.events.addUserSignedIn(this.#onUserSignedIn.bind(this))
    this.#userManager.events.addUserSignedOut(this.#onUserSignedOut.bind(this))
    this.#userManager.events.addUserSessionChanged(this.#onUserSessionChanged.bind(this))

    return this.#userManager.clearStaleState().then(() => {
      return this.silentLogin()
    })
  }

  silentLogin () {
    return this.#userManager.signinSilent()
  }

  login () {
    const userstate = useUserstateStore()
    userstate.setAuthCallbackLocation()

    return this.#userManager.getUser()
      .then(user => user != null
        ? this.#userManager.signinSilent()
          .catch(() => this.#userManager.signinRedirect())
        : this.#userManager.signinRedirect())
  }

  logout () {
    return this.#userManager.signoutRedirect()
  }

  callback () {
    return this.#userManager.signinRedirectCallback()
      .then((user) => {
        if (!!user) {
          const userstate = useUserstateStore()
          const redirectUrl = userstate.getAuthCallbackLocation
          if (redirectUrl) {
            const router = useRouter()
            return router.replace(redirectUrl)
          }
        }
        return user
      })
  }

  #onUserLoaded (user) {
    console.log('user loaded', user)
    this.#user.value = user
    this.#authenticated = !!user
  }

  #onUserUnloaded () {
    this.#user.value = null
    this.#authenticated = false
  }

  #onSilentRenewError (error) {

  }

  #onUserSignedIn () {

  }

  #onUserSignedOut () {

  }

  #onUserSessionChanged () {

  }
}

const instance = new Oauth()

const useOauth = () => instance
export default useOauth
