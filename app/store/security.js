import Vue from 'vue'
import CryptoJS from 'crypto-js'

const initialState = {
  context: {
    authenticationAttempts: 0,
    address: '',
    requiredCheck: '',
    validity: 'VALID',
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
    return JSON.parse(CryptoJS.AES.decrypt(
        state.wallets[options.address].credentials,
        Vue.prototype.$g('salt')
    ).toString(CryptoJS.enc.Utf8))[options.key]


  },
  challengeType: (state) => {
    switch (state.context.requiredCheck) {
      case 'app_start':
        return 'global'
      case 'transaction_start':
      case 'wallet_open':
        return 'wallet'
      default:
        console.log('unrecognised challenge type')
        console.log(state.context.requiredCheck)
        return false
    }
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

    return new Promise((resolve, reject) => {

      // Set global settings as the default
      let challengeUser = state.globalPolicy[options.challenge]
      // Use a try statement and intermediary value here because the wallet might not have parts of this path
      try {
        const walletChallengeCondition = state.wallets[options.address].policy[options.challenge]
        challengeUser = walletChallengeCondition
      } catch (e) {
        console.debug('Wallet does not yet have a policy of it\'s own')
      }

      // Check whether the user authenticated within the acceptable timeout period
      if (challengeUser === true) {
        commit('setRequiredCheck', options.context)
        if (options.hasOwnProperty('address')) {
          commit('setContextProperty', {
            key: 'address',
            value: options.address
          })
        }

        const preparationInterval = setInterval(
            function () {
              if (state.context.requiredCheck === 'INVALID') {
                commit('setRequiredCheck', '')
                clearInterval(preparationInterval)
                reject(true)
              }
              if (state.context.requiredCheck === '') {
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
        console.log('passed auth from get credentials')

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

      if(state.context.lockedUntil !== null) {
        reject('LOCKED')
      }

      if (state.context.authenticationAttempts >= state.authenticationAttemptLimit) {
        commit('setRequiredCheck', 'INVALID')
        commit('setContextProperty', {
          key: 'lockedUntil',
          value: (Date.now() + state.lockoutDuration)
        })
        setInterval(function() {
          commit('setContextProperty', {
            key: 'lockedUntil',
            value: null
          })
        }, state.lockoutDuration)
        commit('resetAttemptCount')
        reject('TOO_MANY_ATTEMPTS')
      }
      commit('incrementAttemptCount')


      const hashedPassword = CryptoJS.SHA256(password + Vue.prototype.$g('salt')).toString()
      if (hashedPassword === state.wallets[state.context.address].password) {
        commit('setRequiredCheck', '')
        commit('resetAttemptCount')
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
  cancelChallenge(state) {
    state.context.requiredCheck = 'INVALID'
  },
  incrementAttemptCount(state) {
    state.context.authenticationAttempts++
  },
  resetAttemptCount(state) {
    state.context.authenticationAttempts = 0
  },
  setContextProperty(state, options) {
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
  // setWalletPassword(state, options) {
  //   console.log('setting password')
  //   console.log(options)
  //   if(!state.wallets.hasOwnProperty(options.address)) {
  //     state.wallets[options.address] = {}
  //   }
  //   // TODO Encrypt the password here
  //   const password = CryptoJS.SHA256(options.password + Vue.prototype.$g('salt')).toString()
  //   state.wallets[options.address].options.password = password
  // },
  setRequiredCheck(state, options) {
    console.log('setting requirement to: ' + options)
    state.context.requiredCheck = options
  },
  setaddress(state, options) {
    state.address = options
  },
  removeWalletPolicy(state, address) {
    Vue.delete(state.wallets, address)
  }

}

