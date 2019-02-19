import Vue from 'vue'
import CryptoJS from 'crypto-js'

export const initialState = {
  context: {
    authenticationAttempts: 0,
    walletAddress: '',
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
  walletPolicies: {}
}

export const state = () => (initialState)

export const getters = {
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
      // Create a blank security policy if needed
      if(!state.walletPolicies.hasOwnProperty(options.walletAddress)) {
        commit('setWalletPolicy', {
          walletAddress: options.walletAddress,
          policy: {}
        })
      }
      // Check to see if the wallet has it's own security option and whether or not it is in currently unlocked period
      if(state.walletPolicies[options.walletAddress].hasOwnProperty(options.context)) {
        if (state.walletPolicies[options.walletAddress].hasOwnProperty('last_authenticated')) {
          const date = Date.now()
          if (date < (state.walletPolicies[options.walletAddress].hasOwnProperty('last_authenticated') + state.lockoutDuration)) {
            resolve()
            return
          }
        }
        if (state.walletPolicies[options.walletAddress][options.context] === false) {
          resolve()
          return
        }
        if (state.globalPolicy[options.context] === false) {
          resolve()
          return
        }
      } else {
        if (state.globalPolicy[options.context] === false) {
          resolve()
          return
        }
      }

      commit('setRequiredCheck', options.context)
      if(options.hasOwnProperty('walletAddress')) {
        commit('setContextProperty', {
          key: 'walletAddress',
          value: options.walletAddress
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
        },200)
        // .bind(context)
    })
  },
  test(state) {
    console.log('hello from test dispatch')
    console.log(state)
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
      console.log(state)
      if (hashedPassword === state.walletPolicies[state.context.walletAddress].password) {
        commit('setRequiredCheck', '')
        commit('resetAttemptCount')
        resolve()
      } else {
        reject('INCORRECT_PASSWORD')
        return false
      }
    })
  },
  monitorWallet({commit, state}, wallet) {
    // TODO Fork handler depending on security rules. await further definition
    commit('setWalletPolicy', {
      walletAddress: wallet.address,
      policy: state.globalPolicy
    })
  }
}

export const mutations = {
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
    if(!state.walletPolicies.hasOwnProperty(options.walletAddress)) {
      state.walletPolicies[options.walletAddress] = {}
    }
    state.walletPolicies[options.walletAddress].securityLevel = options
  },
  setWalletPolicy(state, options) {
    if(!state.walletPolicies.hasOwnProperty(options.walletAddress)) {
      state.walletPolicies[options.walletAddress] = {}
    }
    state.walletPolicies[options.walletAddress] = options.policy
  },
  setWalletPolicyProperty(state, options) {
    if(!state.walletPolicies.hasOwnProperty(options.walletAddress)) {
      state.walletPolicies[options.walletAddress] = {}
    }
    state.walletPolicies[options.walletAddress][options.key] = options.value
  },
  setWalletPassword(state, options) {
    console.log('setting password')
    console.log(options)
    if(!state.walletPolicies.hasOwnProperty(options.walletAddress)) {
      state.walletPolicies[options.walletAddress] = {}
    }
    // TODO Encrypt the password here
    const password = CryptoJS.SHA256(options.password + Vue.prototype.$g('salt')).toString()
    state.walletPolicies[options.walletAddress].password = password
  },
  setRequiredCheck(state, options) {
    console.log('setting requirement to: ' + options)
    state.context.requiredCheck = options
  },
  setWalletAddress(state, options) {
    state.walletAddress = options
  },
  removeWalletPolicy(state, walletAddress) {
    Vue.delete(state.walletPolicies, walletAddress)
  }

}

