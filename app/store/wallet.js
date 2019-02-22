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
        return new Btc(Vue.prototype.$g('bitcoin'))
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
      if(rootState.runtime.isOnline === false || wallet.onChain === false) {
        resolve(wallet)
      }
      switch (wallet.type) {
        case 'aen':
          networkHandler = new Aen(
            state.aen.activeApiEndpoint
          )
          break
        case 'btc':
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Btc(Vue.prototype.$g('bitcoin'))
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
          resolve(wallet)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  transactionsHistorical({state, commit, rootState}, wallet) {
    let networkHandler
    return new Promise((resolve) => {
      if(rootState.runtime.isOnline === false) {
        resolve(wallet)
      }
      switch (wallet.type) {
        case 'aen':
          networkHandler = new Aen(
            state.aen.activeApiEndpoint
          )
          break
        case 'btc':
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Btc(Vue.prototype.$g('bitcoin'))

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
        resolve(wallet)
      })
    })

  },
  getLiveWallet(context, wallet) {
    let networkHandler
    return new Promise((resolve) => {
      switch (wallet.type) {
        case 'aen':
          networkHandler = new Aen(
            context.state.aen.activeApiEndpoint
          )
          networkHandler.getLiveWallet(wallet).then((response) => {
            resolve(response)
          })
          break
        case 'btc':
          networkHandler = new Btc(Vue.prototype.$g('bitcoin'))
          networkHandler.getLiveWallet(wallet).then((response) => {
            resolve(response)
          })
          break
        case 'contract':
          networkHandler = new Contract(
            context.state.eth.activeApiEndpoint
          )
          networkHandler.getLiveWallet(wallet).then((response) => {
            resolve(response)
          })
          break
        case 'eth':
          networkHandler = new Ethereum(
            context.state.eth.activeApiEndpoint
          )
          networkHandler.getLiveWallet(wallet).then((response) => {
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
          networkHandler = new Btc(Vue.prototype.$g('bitcoin'))
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
  transfer(context, options) {
    return new Promise((resolve) => {
      let networkHandler

      // Check whether the destination is using a contact from the address book
      if (typeof options.destination.address === 'object' && options.destination.address !== null) {
        options.destination.address = options.destination.address.address
      }
      switch (options.source.type) {
        case 'aen':
          networkHandler = new Aen(
            context.state.aen.activeApiEndpoint
          )
          networkHandler.transfer(options).then((transfer) => {
            resolve(transfer)
          })
          break
        case 'btc':
          networkHandler = new Btc(Vue.prototype.$g('bitcoin'))
          networkHandler.transfer(options).then((transfer) => {
            resolve(transfer)
          })
          break
        case 'contract':
          networkHandler = new Contract(
            context.state.eth.activeApiEndpoint
          )
          networkHandler.transfer(options).then((transfer) => {
            resolve(transfer)
          })
          break
        case 'eth':
          networkHandler = new Ethereum(
            context.state.eth.activeApiEndpoint
          )
          networkHandler.transfer(options).then((transfer) => {
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
  rankApiNodes(context) {
    console.debug('Vuex: Rank API Nodes')
    const apiEndpoints = Vue.prototype.$g('aen.api_endpoints')
    const stateContext = context

    // Test function encapsulate for variable scoping and asynchronous calling
    const check = function (currentRound) {
      const position = currentRound
      const thisAddress =
                apiEndpoints[position].address +
                Vue.prototype.$g('aen.api_endpoint_test_uri')
      apiEndpoints[position].scanStart = new Date()
      let lowestPing = 9999

      // Perform the actual call
      this.$axios
        .$get(thisAddress)
        .then(() => {
          // Calculate ping time, output the response when in debug mode to satisfy linter
          apiEndpoints[position].scanEnd = new Date()
          apiEndpoints[position].scanTime =
                        apiEndpoints[position].scanEnd -
                        apiEndpoints[position].scanStart

          // If the test beats current score, set as endpoint to use
          if (apiEndpoints[position].scanTime < lowestPing) {
            console.debug(
              'Updating AEN API endpoint to: ' +
                                apiEndpoints[position].address
            )
            lowestPing = apiEndpoints[position].scanTime
            stateContext.commit('setAenProperty', {
              key: 'activeApiEndpoint',
              value: apiEndpoints[position].address
            })
            stateContext.commit('setAenProperty', {
              key: 'activeApiPing',
              value: lowestPing
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
      apiEndpoints.length > currentRound;
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
