import Vue from 'vue'
import Aen from '~/class/network/Aen'
import Bitcoin from '~/class/network/Bitcoin'
import Contract from '~/class/network/Contract'
import Ethereum from '~/class/network/Ethereum'

export const initialState = {
  contacts: {},
  wallets: {},
  aen: {
    haveWallet: false,
    activeApiEndpoint: '',
    activeApiPing: 9999,
    blockHeight: 0,
    blockScore: 0,
    network: {}
  },
  bitcoin: {
    activeApiEndpoint: '',
    activeApiPing: 9999,
    network: {}
  },
  ethereum: {
    activeApiEndpoint: '',
    activeApiPing: 9999,
    network: {}
  },
  internal: {
    walletCheckInterval: 10000,
    apiEndpointPingInterval: 30000,
    networkInformationInterval: 30000
  }
}

export const state = () => initialState

export const getters = {
  haveAenWallet: (state) => {
    for (const wallet in state.wallets) {
      if (state.wallets[wallet].type === 'aen') {
        return true
      }
    }
    return false
  },
  haveEthereumWallet: (state) => {
    for (const wallet in state.wallets) {
      if (state.wallets[wallet].type === 'eth') {
        return true
      }
    }
    return false
  }
}

export const actions = {
  balance: (context, wallet) => {
    let networkHandler
    return new Promise((resolve, reject) => {
      switch (wallet.type) {
        case 'aen':
          networkHandler = new Aen(
            context.state.aen.activeApiEndpoint
          )
          break
        case 'contract':
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Contract(
            context.state.ethereum.activeApiEndpoint
          )
          break
        case 'eth':
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Ethereum(
            context.state.ethereum.activeApiEndpoint
          )
          break
      }
      networkHandler
        .balance(wallet)
        .then((response) => {
          context.commit('setWalletProperty', {
            wallet: wallet,
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
  checkWalletLive(context, wallet) {
    let networkHandler
    return new Promise((resolve) => {
      switch (wallet.type) {
        case 'aen':
          networkHandler = new Aen(
            context.state.aen.activeApiEndpoint
          )
          networkHandler.walletIsLive(wallet).then((response) => {
            context.commit('setWalletProperty', {
              wallet: wallet,
              key: 'onChain',
              value: response
            })
            resolve(response)
          })
          break
        case 'btc':
          networkHandler = new Bitcoin(context.state.bitcoin)
          networkHandler.walletIsLive(wallet).then((response) => {
            context.commit('setWalletProperty', {
              wallet: wallet,
              key: 'onChain',
              value: response
            })
            resolve(wallet)
          })
          break
        case 'contract':
          networkHandler = new Contract(
            context.state.ethereum.activeApiEndpoint
          )
          console.log(networkHandler)
          networkHandler.walletIsLive(wallet).then((response) => {
            context.commit('setWalletProperty', {
              wallet: wallet,
              key: 'onChain',
              value: response
            })
            resolve(response)
          })
          break
        case 'eth':
          networkHandler = new Ethereum(
            context.state.ethereum.activeApiEndpoint
          )
          networkHandler.walletIsLive(wallet).then((response) => {
            context.commit('setWalletProperty', {
              wallet: wallet,
              key: 'onChain',
              value: response
            })
            resolve(response)
          })
          break
      }
    })
  },
  load(context, options) {
    console.debug('Wallet Service:Load ' + options.type)
    console.log(context)
    // var vm = this

    return new Promise((resolve) => {
      const wallet = {
        onChain: false,
        name: options.name,
        balance: 0
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
                // Check if the wallet is on the chain
                context.dispatch('checkWalletLive', wallet)
                // wallet.onChain = networkHandler.walletIsLive(options)
                if (options.hasOwnProperty('main')) {
                  wallet.main = true
                  context.commit('setContext', wallet)
                }
                context.commit('setWallet', wallet)
                resolve(wallet)
              })
          })
          break

        case 'contract':
          networkHandler = new Contract(
            context.state.ethereum.activeApiEndpoint
          )
          networkHandler.walletLoad(options).then((walletObject) => {
            Object.assign(wallet, walletObject)
            context.commit('setWallet', wallet)
            resolve(wallet)
          })
          break

        case 'eth':
          networkHandler = new Ethereum(
            context.state.ethereum.activeApiEndpoint
          )
          networkHandler.walletLoad(options).then((walletObject) => {
            Object.assign(wallet, walletObject)
            context.commit('setWallet', wallet)

            networkHandler.balance(wallet).then((response) => {
              console.debug(response)
              context.commit('setWalletProperty', {
                wallet: wallet,
                key: 'balance',
                value: response
              })
              resolve(wallet)
            })
            context.dispatch('checkWalletLive', wallet)
            resolve(wallet)
          })
          break
      }
    })
  },
  new(context, options) {
    console.debug('Wallet Service:New ' + options.type)

    return new Promise((resolve) => {
      let networkHandler
      switch (options.type) {
        case 'aen':
          networkHandler = new Aen(
            context.state.aen.activeApiEndpoint
          )
          // Do behind the scenes work
          networkHandler.accountNew(options).then((account) => {
            options.account = account
            networkHandler.walletLoad(options).then((wallet) => {
              context.commit('setAenProperty', {
                key: 'haveWallet',
                value: true
              })
              context.commit('setWallet', wallet)
              context.commit('setContact', {
                address: wallet.address,
                displayText: wallet.name,
                network: 'aen'
              })
              resolve(wallet)
            })
          })
          break
        case 'btc':
          networkHandler = new Bitcoin(
            context.state.bitcoin.activeApiEndpoint
          )
          networkHandler.walletNew(options).then((wallet) => {
            context.commit('setWallet', wallet)
            context.commit('setContact', {
              address: wallet.address,
              displayText: wallet.name,
              network: 'btc'
            })
            resolve(wallet)
          })
          break

        case 'eth':
          networkHandler = new Ethereum(
            context.state.ethereum.activeApiEndpoint
          )
          networkHandler.walletNew(options).then((wallet) => {
            context.commit('setWallet', wallet)
            context.commit('setContact', {
              address: wallet.address,
              displayText: wallet.name,
              network: 'eth'
            })
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
      if (
        typeof options.destination.address === 'object' &&
                options.destination.address !== null
      ) {
        options.destination.address =
                    options.destination.address.address
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
        case 'contract':
          networkHandler = new Contract(
            context.state.ethereum.activeApiEndpoint
          )
          networkHandler.transfer(options).then((transfer) => {
            resolve(transfer)
          })
          break
        case 'eth':
          networkHandler = new Ethereum(
            context.state.ethereum.activeApiEndpoint
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
      network: wallet.type,
      address: wallet.address
    }
  },
  setAenProperty(state, options) {
    state.aen[options.key] = options.value
  },
  setBitcoinProperty(state, options) {
    state.bitcoin[options.key] = options.value
  },
  setEthereumProperty(state, options) {
    state.ethereum[options.key] = options.value
  },
  setWalletProperty(state, options) {
    state.wallets[options.wallet.address][options.key] = options.value
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
