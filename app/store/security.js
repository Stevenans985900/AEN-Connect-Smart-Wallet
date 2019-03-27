import Vue from 'vue'
import CryptoJS from 'crypto-js'

const initialState = {
  context: {
    authenticationAttempts: 0,
    address: null,
    requiredCheck: null,
    validity: 'VALID',
    blocking: false,
    lockedUntil: null,
    openUntil: null
  },
  authenticationAttemptLimit: 3,
  lockoutDuration: 30000,
  configured: false,
  securityLevel: 'normal',
  globalPolicy: {
    remove_wallet_global: true,
    app_start: true,
    transaction_start: true,
    wallet_open: false
  },
  wallets: {}
}

export const state = () => (initialState)

export const getters = {
  /**
   * Return a value from the encrypted security store
   * @param state
   * @returns {function(*): string}
   */
  secureProperty: (state) => (options) => {
    console.log('Secure Property')
    return JSON.parse(CryptoJS.AES.decrypt(
        state.wallets[options.address].credentials,
        Vue.prototype.$g('salt')
    ).toString(CryptoJS.enc.Utf8))[options.key]


  }
}

export const actions = {
  /**
     * Gets some generic (non wallet specific) related blockchain information
     *
     * @param {*} context
     */
  addCheck({state, commit}, options) {
    console.debug('Security Store: Add Check')
    console.debug(options)

    return new Promise((resolve) => {

      // Set global settings as the default
      let challengeUser = state.globalPolicy[options.challenge]
      if(state.wallets[options.address].hasOwnProperty('policy')) {
        challengeUser = state.wallets[options.address].policy[options.challenge]
      }

      // Check whether the user authenticated within the acceptable timeout period
      if (challengeUser === true) {
        commit('CONTEXT_PROPERTY', { key: 'validity', value: 'CHALLENGE' })
        commit('CONTEXT_PROPERTY', { key: 'requiredCheck', value: options.challenge })
        commit('CONTEXT_PROPERTY', { key: 'address', value: options.address })

        if(options.hasOwnProperty('blocking')) {
          commit('CONTEXT_PROPERTY', { key: 'blocking', value: true })
        }
        
        const preparationInterval = setInterval(
            function () {
              if (state.context.validity === 'VALID') {
                clearInterval(preparationInterval)
                resolve(true)
              }
            }, 200)
      } else {
        resolve()
      }
    })
  },
  getCredentials({state, dispatch}, address) {
    console.debug('Security Store: Add Check')
    console.debug(address)

    return new Promise((resolve) => {
      dispatch('addCheck', {
        challenge: 'transaction_start',
        address: address
      }).then(() => {
        const credentials = JSON.parse(CryptoJS.AES.decrypt(
            state.wallets[address].credentials,
            Vue.prototype.$g('salt'))
            .toString(CryptoJS.enc.Utf8))
        resolve(credentials)
      })
    })
  },
  checkPassword({state, commit}, password) {
    return new Promise((resolve, reject) => {

      commit('incrementAttemptCount')
      if(state.context.lockedUntil !== null) { reject('LOCKED') }

      // Check if the number of attempts made by user is over the limit and deny
      if (state.context.authenticationAttempts >= state.authenticationAttemptLimit) {
        setInterval(function() {
          commit('CONTEXT_PROPERTY', { key: 'lockedUntil', value: null })
          commit('CONTEXT_PROPERTY', { key: 'authenticationAttempts', value: 0 })
        }, state.lockoutDuration)
        commit('CONTEXT_PROPERTY', { key: 'validity', value: 'INVALID' })
        commit('CONTEXT_PROPERTY', { key: 'lockedUntil', value: (Date.now() + state.lockoutDuration) })
        reject('TOO_MANY_ATTEMPTS')
      }

      const hashedPassword = CryptoJS.SHA256(password + Vue.prototype.$g('salt')).toString()
      if (hashedPassword === state.wallets[state.context.address].password) {
        commit('CONTEXT_PROPERTY', { key: 'authenticationAttempts', value: 0 })
        commit('CONTEXT_PROPERTY', { key: 'validity', value: 'VALID' })
        commit('CONTEXT_PROPERTY', { key: 'blocking', value: false })
        resolve()
      } else {
        reject('INCORRECT_PASSWORD')
        return false
      }
    })
  },
  monitorWallet({commit}, wallet) {

    const credentials = CryptoJS.AES.encrypt(JSON.stringify(wallet.credentials), Vue.prototype.$g('salt')).toString()
    const hashedPassword = CryptoJS.SHA256(wallet.credentials.password + Vue.prototype.$g('salt')).toString()

    // TODO Fork handler depending on security rules. await further definition
    commit('setWallet', {
      address: wallet.address,
      password: hashedPassword,
      credentials: credentials
    })
  }
}

export const mutations = {
  removeWallet(state, wallet) {
    Vue.delete(state.wallets, wallet.address)
  },
  setWallet(state, wallet) {
    state.wallets[wallet.address] = wallet
  },
  reset(state) {
    Object.assign(state, initialState)
  },
  incrementAttemptCount(state) {
    state.context.authenticationAttempts++
  },
  resetAttemptCount(state) {
    state.context.authenticationAttempts = 0
  },
  CONTEXT_PROPERTY(state, options) {
    state.context[options.key] = options.value
  },
  setGlobalPolicy(state, options) {
    state.globalPolicy = options
  },
  setGlobalPolicyProperty(state, options) {
    state.globalPolicy[options.key] = options.value
  },
  setGlobalSecurityLevel(state, options) {
    state.securityLevel = options
  },
  setWalletSecurityLevel(state, options) {
    if(!state.wallets.hasOwnProperty(options.address)) {
      state.wallets[options.address] = {}
    }
    state.wallets[options.address].securityLevel = options
  },
  WALLET_POLICY(state, options) {
    state.wallets[options.address].policy = options.policy
  },
  setWalletPolicyProperty(state, options) {
    if(!state.wallets.hasOwnProperty(options.address)) {
      state.wallets[options.address] = {}
    }
    state.wallets[options.address].policy[options.key] = options.value
  },
  setaddress(state, options) {
    state.address = options
  },
  removeWalletPolicy(state, address) {
    Vue.delete(state.wallets, address)
  }

}

