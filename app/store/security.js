
export const initialState = {
  configured: false,
  walletAddress: '',
  globalPolicy: {
    remove_wallet_global: true,
    app_start: true,
    transaction_start: true,
    wallet_open: false
  },
  walletPolicies: {

  },
  requiredCheck: ''
}

export const state = () => (initialState)

export const getters = {
  challengeType: (state) => {
    switch (state.requiredCheck) {
      case 'app_start':
        return 'global'
      case 'transaction_start':
      case 'wallet_open':
        return 'wallet'
      default:
        console.log('unrecognised challenge type')
        console.log(state.requiredCheck)
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
  addCheck(context, options) {
    console.debug('Security Store: Add Check')
    console.debug(options)
    console.log('adding check')
    return new Promise((resolve, reject) => {
      // Check to see if the wallet has it's own security option
      let rule = false
      // Try using wallet specific policy if available
      try {
        rule = context.state.walletPolicies[options.walletAddress][options.context]
      } catch (e) {
        rule = context.state.globalPolicy[options.context]
      }
      console.log(rule)
      if(rule !== true) {
        resolve(true)
      } else {
        context.commit('setRequiredCheck', options.context)
        if(options.hasOwnProperty('walletAddress')) {
          context.commit('setWalletAddress', options.walletAddress)
        }
        const preparationInterval = setInterval(
          function () {
            if (context.state.requiredCheck === 'INVALID') {
              context.commit('setRequiredCheck', '')
              clearInterval(preparationInterval)
              reject(true)
            }
            if (context.state.requiredCheck === '') {
              clearInterval(preparationInterval)
              resolve(true)
            }
          }.bind(context),200)
      }
    })

  }
}

export const mutations = {
  reset(state) {
    Object.assign(state, initialState)
  },
  setGlobalPolicy(state, options) {
    state.globalPolicy = options
  },
  setGlobalPolicyProperty(state, options) {
    state.defaultPolicy[options.key] = options.value
  },
  setWalletPolicy(state, options) {
    state.walletPolicies[options.walletAddress] = options.policy
  },
  setWalletPolicyProperty(state, options) {
    state.walletPolicies[options.walletAddress][options.key] = options.value
  },
  setRequiredCheck(state, options) {
    console.log('setting requirement to: ' + options)
    state.requiredCheck = options
  },
  setWalletAddress(state, options) {
    state.walletAddress = options
  }

}

