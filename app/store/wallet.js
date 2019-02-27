import Vue from 'vue'
import Aen from '~/class/network/Aen'
import Btc from '~/class/network/Btc'
import Contract from '~/class/network/Contract'
import Ethereum from '~/class/network/Ethereum'

export const initialState = {
  contacts: {},
  wallets: {},
  aen: {
    mainAddress: '',
    activeApiEndpoint: '',
    activeApiPing: 9999,
    blockHeight: 0,
    blockScore: 0,
    network: {},
    symbol: 'aen'
  },
  btc: {
    activeApiEndpoint: '',
    activeApiPing: 9999,
    network: {},
    symbol: 'btc'
  },
  eth: {
    activeApiEndpoint: '',
    activeApiPing: 9999,
    network: {},
    symbol: 'wei'
  },
  internal: {
    walletCheckInterval: 10000,
    apiEndpointPingInterval: 30000,
    networkInformationInterval: 30000
  }
}

export const state = () => initialState

export const getters = {
  getByName: (state) => (walletName) => {
    for (let walletAddress in state.wallets) {
      if(state.wallets[walletAddress].name === walletName) {
        return state.wallets[walletAddress]
      }
    }
    return false
  },
  // TODO Move the contact handling to a store of it's own
  /**
   * Get a contact by the display name
   *
   * @param state
   * @returns {Function}
   */
  contactByProperty: (state) => (options) => {
    for (let contact in state.contacts) {
      if(state.contacts[contact][options.property] === options.value) {
        return state.contacts[contact]
      }
    }
    return false
  },
  /**
   * Get all available contacts pertinent to a wallet
   *
   * @param state
   * @returns {function(*): Array}
   */
  contactsByWallet: (state) => (wallet) => {
    let contacts = []
    for (let contactIndex in state.contacts) {
      let contact = state.contacts[contactIndex]
      if(contact.type === wallet.type && wallet.address !== contactIndex) {
        contacts.push(contact)
      }
    }
    return contacts
  },
  networkHandler: (state) => (type) => {
    switch (type) {
      case 'aen':
        return new Aen(state.aen.activeApiEndpoint)
      case 'btc':
        return new Btc(Vue.prototype.$g('btc'))
      case 'contract':
        return new Contract(state.eth.activeApiEndpoint)
      case 'eth':
        return new Ethereum(state.eth.activeApiEndpoint)
    }
  },
  walletsByType: (state) => (type) => {
    let wallets = []
    for (const wallet in state.wallets) {
      if (state.wallets[wallet].type === type) {
        wallets.push(state.wallets[wallet])
      }
    }
    return wallets
  },
  haveWalletType: (state) => (type) => {
    for (const wallet in state.wallets) {
      if (state.wallets[wallet].type === type) {
        return true
      }
    }
    return false
  }
}

export const actions = {
  balance: ({state, commit, rootState}, wallet) => {
    let networkHandler
    return new Promise((resolve, reject) => {
      // Use cache if offline or wallet not yet recognised on network
      if(rootState.runtime.isOnline === false || wallet.onChain === false) {
        resolve(wallet)
      }
      // Use cache if function called to recently
      if((Date.now() - wallet.balanceLastSynced) < Vue.prototype.$g('internal.walletRefreshGraceTime')) {
        resolve(wallet)
        return
      }
      // Set the page loader going
      commit('setLoading', {
        t: 'page',
        v: true,
        m: 'wallet.message.updating_balance'
      }, { root: true })
      switch (wallet.type) {
        case 'aen':
          networkHandler = new Aen(
            state.aen.activeApiEndpoint
          )
          break
        case 'btc':
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Btc(Vue.prototype.$g('btc'))
          break
        case 'contract':
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Contract(
            state.eth.activeApiEndpoint
          )
          break
        case 'eth':
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Ethereum(
            state.eth.activeApiEndpoint
          )
          break
      }
      networkHandler
        .balance(wallet)
        .then((response) => {
          commit('setWalletProperty', {
            address: wallet.address,
            key: 'balance',
            value: response
          })
          commit('setWalletProperty', {
            address: wallet.address,
            key: 'balanceLastSynced',
            value: Date.now()
          })
          commit('setLoading', {
            t: 'page',
            v: false
          }, { root: true })
          resolve(wallet)
        })
        .catch((err) => {
          commit('setLoading', {
            t: 'page',
            v: false
          }, { root: true })
          reject(err)
        })
    })
  },
  transactionsHistorical({state, commit, rootState}, wallet) {
    let networkHandler
    return new Promise((resolve) => {
      // Use cache if offline or wallet not yet recognised on network
      if(rootState.runtime.isOnline === false || wallet.onChain === false) {
        resolve(wallet)
      }
      // Use cache if function called to recently
      if((Date.now() - wallet.transactionsLastSynced) < Vue.prototype.$g('internal.walletRefreshGraceTime')) {
        resolve(wallet)
        return
      }
      commit('setLoading', {
        t: 'page',
        v: true,
        m: 'wallet.message.updating_history'
      }, { root: true })
      switch (wallet.type) {
        case 'aen':
          networkHandler = new Aen(
            state.aen.activeApiEndpoint
          )
          break
        case 'btc':
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Btc(Vue.prototype.$g('btc'))

          break
        case 'contract':
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Contract(
            state.eth.activeApiEndpoint
          )
          break
        case 'eth':
          networkHandler = new Ethereum(state.eth.activeApiEndpoint)
          break
      }
      // Do behind the scenes work
      networkHandler.transactionsHistorical(wallet).then((transactions) => {
        commit('setWalletProperty', {
          address: wallet.address,
          key: 'transactions',
          value: transactions
        })
        commit('setWalletProperty', {
          address: wallet.address,
          key: 'transactionsLastSynced',
          value: Date.now()
        })
        commit('setLoading', {
          t: 'page',
          v: false
        }, { root: true })
        resolve(wallet)
      })
    })

  },
  getLiveWallet({commit, state }, wallet) {
    let networkHandler
    return new Promise((resolve) => {
      commit('setLoading', {
        t: 'page',
        v: true,
        m: 'wallet.message.checking_wallet_status'
      }, { root: true })
      switch (wallet.type) {
        case 'aen':
          networkHandler = new Aen(
            state.aen.activeApiEndpoint
          )
          networkHandler.getLiveWallet(wallet).then((response) => {
            commit('setLoading', {
              t: 'page',
              v: false
            }, { root: true })
            resolve(response)
          })
          break
        case 'btc':
          networkHandler = new Btc(Vue.prototype.$g('btc'))
          networkHandler.getLiveWallet(wallet).then((response) => {
            commit('setLoading', {
              t: 'page',
              v: false
            }, { root: true })
            resolve(response)
          })
          break
        case 'contract':
          networkHandler = new Contract(
            state.eth.activeApiEndpoint
          )
          networkHandler.getLiveWallet(wallet).then((response) => {
            commit('setLoading', {
              t: 'page',
              v: false
            }, { root: true })
            resolve(response)
          })
          break
        case 'eth':
          networkHandler = new Ethereum(
            state.eth.activeApiEndpoint
          )
          networkHandler.getLiveWallet(wallet).then((response) => {
            commit('setLoading', {
              t: 'page',
              v: false
            }, { root: true })
            resolve(response)
          })
          break
      }
    })
  },
  load({state, commit, dispatch}, options) {
    console.debug('Wallet Service:Load ' + options.type)
    // var vm = this

    return new Promise((resolve) => {
      const wallet = {
        onChain: false,
        name: options.name,
        balance: 0,
        balanceLastSynced: false,
        transactions: [],
        transactionsLastSynced: false,
        type: options.type
      }

      let networkHandler
      switch (options.type) {
        case 'aen':
          networkHandler = new Aen()
          // Do behind the scenes work
          networkHandler.accountLoad(options).then((accountObject) => {
            options.account = accountObject
            networkHandler
              .walletLoad(options)
              .then((walletObject) => {
                Object.assign(wallet, walletObject)
                // wallet.onChain = networkHandler.getLiveWallet(options)
                if(options.main === true) {
                  commit('setAenProperty', {
                    key: 'mainAddress',
                    value: wallet.address
                  })
                }
                dispatch('security/monitorWallet', wallet, {root:true})
                delete wallet.credentials
                commit('setWallet', wallet)
                resolve(wallet)
              })
          })
          break

        case 'contract':
          networkHandler = new Contract(
            state.eth.activeApiEndpoint
          )
          networkHandler.walletLoad(options).then((walletObject) => {
            Object.assign(wallet, walletObject)
            commit('setWallet', wallet)
            resolve(wallet)
          })
          break

        case 'eth':
          networkHandler = new Ethereum(
            state.eth.activeApiEndpoint
          )
          networkHandler.walletLoad(options).then((walletObject) => {
            Object.assign(wallet, walletObject)
            dispatch('security/monitorWallet', wallet, {root:true})
            delete wallet.credentials
            commit('setWallet', wallet)
            resolve(wallet)
          })
          break
      }
    })
  },
  new({dispatch, state, commit}, options) {
    
    return new Promise((resolve) => {
      const wallet = {
        onChain: false,
        name: options.name,
        balance: 0,
        balanceLastSynced: false,
        transactions: [],
        transactionsLastSynced: false,
        type: options.type
      }
      let networkHandler
      switch (options.type) {
        case 'aen':
          networkHandler = new Aen(
            state.aen.activeApiEndpoint
          )
          // Do behind the scenes work
          networkHandler.accountNew(options).then((account) => {
            options.account = account
            networkHandler.walletLoad(options).then((walletObject) => {
              Object.assign(wallet, walletObject)
              if(options.main === true) {
                commit('setAenProperty', {
                  key: 'mainAddress',
                  value: wallet.address
                })
              }
              dispatch('security/monitorWallet', wallet, {root:true})
              delete wallet.credentials
              commit('setWallet', wallet)
              resolve(wallet)
            })
          })
          break
        case 'btc':
          networkHandler = new Btc(Vue.prototype.$g('btc'))
          networkHandler.walletNew(options).then((walletObject) => {
            Object.assign(wallet, walletObject)
            dispatch('security/monitorWallet', wallet, {root:true})
            delete wallet.credentials
            commit('setWallet', wallet)
            resolve(wallet)
          })
          break

        case 'eth':
          networkHandler = new Ethereum(state.eth.activeApiEndpoint)
          networkHandler.walletNew(options).then((walletObject) => {
            Object.assign(wallet, walletObject)
            console.log('about to add wallet to security')
            dispatch('security/monitorWallet', wallet, {root:true})
            delete wallet.credentials
            commit('setWallet', wallet)
            resolve(wallet)
          })
          break
      }
    })
  },
  transfer({commit, state}, options) {
    return new Promise((resolve) => {
      let networkHandler

      // Check whether the destination is using a contact from the address book
      if (typeof options.destination.address === 'object' && options.destination.address !== null) {
        options.destination.address = options.destination.address.address
      }
      commit('setLoading', {
        t: 'page',
        v: true,
        m: 'wallet.message.updating_balance'
      }, { root: true })
      switch (options.source.type) {
        case 'aen':
          networkHandler = new Aen(
            state.aen.activeApiEndpoint
          )
          networkHandler.transfer(options).then((transfer) => {
            commit('setLoading', {
              t: 'page',
              v: false
            }, { root: true })
            resolve(transfer)
          })
          break
        case 'btc':
          networkHandler = new Btc(Vue.prototype.$g('btc'))
          networkHandler.transfer(options).then((transfer) => {
            commit('setLoading', {
              t: 'page',
              v: false
            }, { root: true })
            resolve(transfer)
          })
          break
        case 'contract':
          networkHandler = new Contract(
            state.eth.activeApiEndpoint
          )
          networkHandler.transfer(options).then((transfer) => {
            commit('setLoading', {
              t: 'page',
              v: false
            }, { root: true })
            resolve(transfer)
          })
          break
        case 'eth':
          networkHandler = new Ethereum(
            state.eth.activeApiEndpoint
          )
          networkHandler.transfer(options).then((transfer) => {
            commit('setLoading', {
              t: 'page',
              v: false
            }, { root: true })
            resolve(transfer)
          })
          break
      }
    })
  },
  /**
     * Cycle through all available API nodes, testing how long it takes to get information on
     * the first block. Choose node with lowest ping
     *
     * @param {*} context
     */
  rankApiNodes({ commit, state }) {
    console.debug('Wallet Store: Rank API Nodes')

    const apiEndpoints = Vue.prototype.$g('aen.api_endpoints')
    const apiCount = apiEndpoints.length

    // Test function encapsulate for variable scoping and asynchronous calling
    const check = function (currentRound) {
      const position = currentRound
      const thisAddress = apiEndpoints[position].address + Vue.prototype.$g('aen.api_endpoint_test_uri')
      apiEndpoints[position].scanStart = new Date()

      // Perform the actual call
      this.$axios
        .$get(thisAddress)
        .then(() => {
          // Calculate ping time, output the response when in debug mode to satisfy linter
          apiEndpoints[position].scanEnd = new Date()
          apiEndpoints[position].scanTime = apiEndpoints[position].scanEnd - apiEndpoints[position].scanStart

          // If the test beats current score, set as endpoint to use
          if (apiEndpoints[position].scanTime < state.aen.activeApiPing) {
            console.debug('Updating AEN API endpoint to: ' + apiEndpoints[position].address)
            commit('setAenProperty', {
              key: 'activeApiEndpoint',
              value: apiEndpoints[position].address
            })
            commit('setAenProperty', {
              key: 'activeApiPing',
              value: apiEndpoints[position].scanTime
            })
          }
        })
        .catch(() => {
          console.log('Node offline: ' + thisAddress)
        })
    }.bind(this)

    // Start performing the checks asynchronously
    for (
      let currentRound = 0;
      apiCount > currentRound;
      currentRound++
    ) {
      check(currentRound)
    }
  }
}

export const mutations = {
  reset(state) {
    Object.assign(state, initialState)
  },
  removeWallet(state, wallet) {
    Vue.delete(state.wallets, wallet.address)
  },
  setAccountStatus(state, status) {
    state.meta.wallet_present = status
  },
  setWallet(state, wallet) {
    state.wallets[wallet.address] = wallet
    if (wallet.type === 'aen') {
      state.aen.haveWallet = true
    }
    state.contacts[wallet.address] = {
      displayText: wallet.name,
      type: wallet.type,
      address: wallet.address
    }
  },
  setAenProperty(state, options) {
    state.aen[options.key] = options.value
  },
  setBtcProperty(state, options) {
    state.btc[options.key] = options.value
  },
  setEthereumProperty(state, options) {
    state.eth[options.key] = options.value
  },
  setWalletProperty(state, options) {
    state.wallets[options.address][options.key] = options.value
  },
  setProperty(state, options) {
    state.wallets[options.address][options.key] = options.value
  },
  /**
     * Address Book related information
     */
  deleteContact(state, contact) {
    Vue.delete(state.contacts, contact.address)
  },
  setContact(state, contact) {
    state.contacts[contact.address] = contact
  },
  setPreferredNode(state, address) {
    state.internal.preferredNode = address
  },
  setActiveNodeList(state, nodeList) {
    state.internal.nodeList = nodeList
  },
  setNetwork(state, network) {
    state.context.network = network
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
  setContextProperty(state, input) {
    state.context[input.key] = input.value
  },
  setInternalProperty(state, input) {
    state.internal[input.key] = input.value
  },
  setMosaics(state, input) {
    state.mosaics = input
  }
}
