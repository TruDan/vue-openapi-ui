import { UserManager, Log } from 'oidc-client'
import { ref, toRaw } from 'vue'
import useUserstateStore from 'stores/userstate'
import { useRouter } from 'vue-router'
import { Router } from 'src/router'

// Log.logger = console
// Log.level = Log.DEBUG

class Oauth {

  static #defaultOptions = {
    automaticSilentRenew: true,
    redirect_uri: 'oauth2-callback.html',
    response_mode: 'fragment'
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

  init (options) {

    const opts = Object.assign({}, Oauth.#defaultOptions, options)
    if (opts.redirect_uri) {
      if (!/^(?:\/|\w+:\/\/)/.test(opts.redirect_uri)) {
        opts.redirect_uri = new URL(opts.redirect_uri, window.origin).toString()
      }
    }
    this.#userManager = new UserManager(opts)
    this.#userManager.events.addUserLoaded(this.#onUserLoaded.bind(this))
    this.#userManager.events.addUserUnloaded(this.#onUserUnloaded.bind(this))
    this.#userManager.events.addSilentRenewError(this.#onSilentRenewError.bind(this))
    this.#userManager.events.addUserSignedIn(this.#onUserSignedIn.bind(this))
    this.#userManager.events.addUserSignedOut(this.#onUserSignedOut.bind(this))
    this.#userManager.events.addUserSessionChanged(this.#onUserSessionChanged.bind(this))

    return this.#userManager.clearStaleState()
      .then(() => {
      return this.#userManager.getUser();
    })
  }

  silentLogin () {
    return this.#userManager.signinSilent()
  }

  login () {
    const userstate = useUserstateStore()
    userstate.setAuthCallbackLocation()

    return this.#userManager.signinRedirect()
  }

  logout () {
    return this.#userManager.signoutRedirect()
  }

  callback () {
    return this.#userManager.signinRedirectCallback()
      .then((user) => {
        if (!!user) {
          const userstate = useUserstateStore()

          userstate.setOauthUser(user);

          const redirectUrl = userstate.getAuthCallbackLocation
          if (redirectUrl) {
            const router = useRouter()
            return router.replace(redirectUrl).then(() => ({
              user,
              redirectUrl: redirectUrl
            }))
          }
        }

        return {
          user,
          redirectUrl: undefined
        }
      })
  }

  #onUserLoaded (user) {
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
