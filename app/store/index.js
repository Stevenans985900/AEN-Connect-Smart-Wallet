import Vue from 'vue'

export const initialState = {
  // Snackbar Controls
  notification: {
    show: false,
    type: 'success',
    message: 'message_placeholder',
    timeout: 6000
  },
  // Used for defining time periods to be used in intervals and timeouts
  time_definitions: {},
  // High level app properties
  runtime: {
    migration_version: '',
    known_version: '',
    mode: 'web',
    environment: 'production',
    isOnline: false,
    // Even though Vue is reactive, some of the deep components use calculations along with computed properties. This
    // counter provides a simple way to watch for such events firing removing the need to watch deep
    renderCounter: 0,
    // This option will tell the app to check if the wallet has been
    debounce_wallet_updates: true
  },
  // When running as a desktop app
  electron: {
    dockerPresent: false,
    runningLocalNode: false
  },
  // State and stages of app status
  busy: {
    global: true,
    router: true,
    page: false,
    message: ''
  },
  // Shared user preferences
  user: {
    rememberUser: false,
    eulaAgree: false,
    developmentAgreed: false,
    help: false,
    locale: 'en'
  }
}

export const state = () => (initialState)

export const getters = {
  notificationState: (state) => {
    return state.notification.show
  },
  booting: (state) => {
    return state.busy.global
  },
  environment: (state) => {
    return state.runtime.environment
  },
  functionalityDisabled: (state) => {
    if(state.runtime.isOnline === false || state.user.eulaAgree === false) {
      return true
    }
    return false
  },
  busy: (state) => {
    return state.busy.page
  },
  loading: (state) => {
    if (
      state.busy.global === true ||
            state.busy.router === true) {
      return true
    }
  }
}

export const actions = {
  busy({state, commit}, input) {
    if(input === false) {
      commit('BUSY', false)
    } else {
      commit('BUSY', input)
      // Start a timeout countdown to make sure the app isn't hanging and can gracefully recover
      setTimeout(function() {
        // Check if the page is still busy
        Vue.$log.debug('after interval, checking whether function finished', input, state.busy.page)
        if(state.busy.page === true) {
          Vue.$log.error(input)
          commit('BUSY', false)
        }
      }.bind(state, commit), 6000)
    }
  },
}
export const mutations = {
  setRenderCounter(state, value) {
    state.runtime.renderCounter = value
  },
  emitRenderEvent(state) {
    state.runtime.renderCounter += 1
  },
  reset(state) {
    Object.assign(state, initialState)
  },
  setAccountStatus(state, status) {
    state.meta.wallet_present = status
  },
  setEnvironment(state, environmentName) {
    state.meta.environment = environmentName
  },
  setElectronProperty(state, options) {
    state.electron[options.key] = options.value
  },
  setInternalProperty(state, options) {
    state.internal[options.key] = options.value
  },
  setRuntimeProperty(state, options) {
    state.runtime[options.key] = options.value
  },
  RUNTIME_PROP(state, options) {
    state.runtime[options.key] = options.value
  },
  setUserProperty(state, options) {
    state.user[options.key] = options.value
  },
  USER_PROP(state, options) {
    state.user[options.key] = options.value
  },
  setMeta(state, options) {
    state.meta[options.key] = options.value
  },
  addWallet(state, wallet) {
    // if (!state.wallets.hasOwnProperty(wallet.address)) {
    state.wallets[wallet.address] = wallet
    // }
  },
  // Setting a AEN wallet to main context
  setActiveWallet(state, wallet) {
    state.meta.walletPresent = true
    state.activeWallet.privateKey = wallet.privateKey
    state.activeWallet.address = wallet.address

    // Check whether the wallet exists in
    // if (!state.wallets.hasOwnProperty(state.activeWallet.address)) {
    state.wallets[state.activeWallet.address] = wallet
    // }
  },
  setAccount(state, account) {
    state.activeWallet.public_key = account.publicKey
    state.activeWallet.private_key = account.privateKey
  },
  setPassword(state, password) {
    state.activeWallet.password = password
  },
  setRememberUser(state, value) {
    state.meta.rememberUser = value
  },
  /**
     * t = type
     * v = boolean conditions
     * m = message
     * @param {*} state
     * @param {*} loadingObject
     */
  setLoading(state, loadingObject) {
    state.busy[loadingObject.t] = loadingObject.v
    if (loadingObject.hasOwnProperty('m')) {
      state.busy.message = loadingObject.m
    }
  },
  /**
   *
   * @param state
   * @param input
   * @constructor
   */
  BUSY(state, input) {
    if(input === false) {
      state.busy.page = false
    } else {
      state.busy.page = true
      state.busy.message = input
    }
  },
  setRouterLoading(state, value) {
    state.internal.router_loading = value
  },
  /**
     * Address Book related information
     */
  addContact(state, contact) {
    state.contacts.push(contact)
  },
  deleteContact(state, contact) {
    const indexPosition = state.contacts.findIndex(i => i === contact)
    state.contacts.splice(indexPosition, 1)
  },
  editContact(state, changeObjects) {
    const indexPosition = state.contacts.findIndex(i => i === changeObjects.original)
    state.contacts.splice(indexPosition, 1)
    state.contacts.push(changeObjects.updated)
  },
  setApiEndpoint(state, value) {
    state.internal.activeApiEndpoint = value
  },
  setPingTime(state, value) {
    state.internal.apiPing = value
  },
  setPreferredNode(state, address) {
    state.internal.preferredNode = address
  },
  setActiveNodeList(state, nodeList) {
    state.internal.nodeList = nodeList
  },
  setNetwork(state, network) {
    state.activeWallet.network = network
  },
  setBlockHeight(state, blockHeight) {
    state.internal.block_height = blockHeight
  },
  setBlockScore(state, blockScore) {
    state.internal.block_score = blockScore
  },
  dismissNotification(state) {
    state.notification.show = false
  },
  CACHE_SKIP(state, boolean) {
    state.runtime.skipCacheNextOp = boolean
  },
  showNotification(state, inputObject) {
    inputObject.show = true
    state.notification = inputObject
  },
  setIncomingTransactions(state, transactions) {
    state.transactions.incoming = transactions
  },
  setUnconfirmedTransactions(state, transactions) {
    state.transactions.unconfirmed = transactions
  },
  setOutgoingTransactions(state, transactions) {
    state.transactions.outgoing = transactions
  },
  setNotificationStatus(state, status) {
    state.notification.show = status
  },
  setDeviceSetting(state, input) {
    state.settings[input.key] = input.value
  },
  setAccountProperty(state, input) {
    state.activeWallet[input.key] = input.value
  },
  setMosaics(state, input) {
    state.mosaics = input
  },
  setAppMode(state, mode) {
    state.runtime.mode = mode
  },
  TIME_DEF(state, input) {
    if(input.hasOwnProperty('key')) {
      Vue.set(state.time_definitions, input.key, input.value)
    } else {
      state.time_definitions = Object.assign({}, state.time_definitions, input)
    }
  }
}
