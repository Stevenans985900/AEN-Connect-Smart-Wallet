import Vue from 'vue'
import Aen from '~/class/network/Aen'
import Btc from '~/class/network/Btc'
import Contract from '~/class/network/Contract'
import Eth from '~/class/network/Eth'

export const initialState = {
  contacts: {},
  wallets: {},
  aen: {
    mainAddress: '',
    activeApiEndpoint: '',
    apiPing: 9999,
    blockHeight: 0,
    blockScore: 0,
    network: {},
    displaySymbol: 'default'
  },
  btc: {
    activeApiEndpoint: '',
    apiPing: 9999,
    network: {},
    displaySymbol: 'default'
  },
  eth: {
    activeApiEndpoint: '',
    apiPing: 9999,
    network: {},
    displaySymbol: 'default'
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
        return new Aen(
            state.aen.activeApiEndpoint,
            Vue.prototype.$g('aen')
        )
      case 'btc':
        return new Btc(state.btc.activeApiEndpoint, Vue.prototype.$g('btc'))
      case 'contract':
        return new Contract(state.eth.activeApiEndpoint)
      case 'eth':
        return new Eth(state.eth.activeApiEndpoint, Vue.prototype.$g('eth'))
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
    let apiEndpoint, networkHandler
    return new Promise((resolve, reject) => {
      // Use cache if offline or wallet not yet recognised on network
      if(rootState.runtime.isOnline === false || wallet.onChain === false) {
        resolve(wallet)
      }
      // Use cache if function called to recently
      if((Date.now() - wallet.balanceLastSynced) < Vue.prototype.$g('internal.walletRefreshGraceTime')) {
        if(rootState.runtime.skipCacheNextOp === true) {
          console.debug('Skipping cache')
          commit('CACHE_SKIP', false, { root: true})
        } else {
          console.debug('Balance: Using cache')
          resolve(wallet)
          return
        }
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
              state.aen.activeApiEndpoint,
              Vue.prototype.$g('aen')
          )
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
                resolve(wallet)
              })
              .catch((err) => {
                reject(err)
              })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
        case 'btc':
          resolve(wallet)
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Btc(state.btc.activeApiEndpoint, Vue.prototype.$g('btc'))
          networkHandler
              .balance(wallet)
              .then((response) => {
                commit('setWalletProperty', {
                  address: wallet.address,
                  key: 'balance',
                  value: response.balance
                })
                commit('setWalletProperty', {
                  address: wallet.address,
                  key: 'managedAddressesWithTokens',
                  value: response.wallets
                })
                commit('setWalletProperty', {
                  address: wallet.address,
                  key: 'balanceLastSynced',
                  value: Date.now()
                })
                resolve(wallet)
              })
              .catch((err) => {
                reject(err)
              })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
        case 'contract':
          // TODO For this active API endpoint, mixin network selection
          apiEndpoint = state.eth.activeApiEndpoint
              .replace('###NETWORK_IDENTIFIER###', state.wallets[wallet.managerWalletAddress].network.identifier)
          networkHandler = new Contract(apiEndpoint, Vue.prototype.$g('eth'))
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
                resolve(wallet)
              })
              .catch((err) => {
                reject(err)
              })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
        case 'eth':
          // TODO For this active API endpoint, mixin network selection
          apiEndpoint = state.eth.activeApiEndpoint
              .replace('###NETWORK_IDENTIFIER###', wallet.network.identifier)
          networkHandler = new Eth(apiEndpoint, Vue.prototype.$g('eth'))
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
                resolve(wallet)
              })
              .catch((err) => {
                reject(err)
              })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
      }

    })
  },
  transactionsHistorical({state, commit, rootState}, wallet) {
    let apiEndpoint, networkHandler
    return new Promise((resolve) => {
      // Use cache if offline or wallet not yet recognised on network
      if(rootState.runtime.isOnline === false || wallet.onChain === false) {
        resolve(wallet)
      }
      // Use cache if function called to recently
      console.log('getting historical transactions')
      if((Date.now() - wallet.transactionsLastSynced) < Vue.prototype.$g('internal.walletRefreshGraceTime')) {
        if(rootState.runtime.skipCacheNextOp === true) {
          console.debug('Skipping cache')
          commit('CACHE_SKIP', false, { root: true})
        } else {
          console.debug('Transactions Historical: Using cache')
          resolve(wallet)
          return
        }
      }
      commit('setLoading', {
        t: 'page',
        v: true,
        m: 'wallet.message.updating_history'
      }, { root: true })
      switch (wallet.type) {
        case 'aen':
          networkHandler = new Aen(
              state.aen.activeApiEndpoint,
              Vue.prototype.$g('aen')
          )
          // Do behind the scenes work
          networkHandler.transactionsHistorical(wallet).then((headTransactions) => {
            // Create a new transaction array
            const transactions = Object.assign({}, wallet.transactions, headTransactions)
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
          break
        case 'btc':
          // TODO For this active API endpoint, mixin network selection
          networkHandler = new Btc(state.btc.activeApiEndpoint, Vue.prototype.$g('btc'))
          // Do behind the scenes work
          networkHandler.transactionsHistorical(wallet).then((headTransactions) => {

            const mnemonic = this.getters['security/secureProperty']({
              key: 'mnemonic',
              address: wallet.address
            })

            // Check if any of the transactions are incoming in order to push the BIP index forward
            for(let key in headTransactions) {
              let transaction = headTransactions[key]
              console.log('inspecting transaction', transaction)
              if(transaction.tx_input_n === -1) {
                networkHandler.transactionInfo({
                  hash: transaction.tx_hash,
                  network: wallet.network
                }).then((transactionInformation) => {
                  console.log('got detailed info:', transactionInformation)
                  // If one of the output addresses matches the current BIP index, move it forward
                  if(transactionInformation.addresses.includes(wallet.receiverAddress)) {
                    const managedAddressesWithTokens = Object.assign({}, wallet.managedAddressesWithTokens)
                    managedAddressesWithTokens[wallet.address] = 0
                    commit('setWalletProperty', {
                      address: wallet.address,
                      key: 'managedAddressesWithTokens',
                      value: managedAddressesWithTokens
                    })
                    // Generate the next BIP address for receiving
                    commit('setWalletProperty', {
                      address: wallet.address,
                      key: 'currentBipIndex',
                      value: (wallet.currentBipIndex + 1)
                    })
                    networkHandler.receieverAddress(
                        {
                          wallet: wallet,
                          mnemonic: mnemonic
                        }
                    ).then((address) => {
                      commit('setWalletProperty', {
                        address: wallet.address,
                        key: 'receiverAddress',
                        value: address
                      })
                    })
                  }
                })
              }
            }
            // Create a new transaction array
            const transactions = Object.assign({}, wallet.transactions, headTransactions)

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

          break
        case 'contract':
          // TODO For this active API endpoint, mixin network selection
          apiEndpoint = state.eth.activeApiEndpoint
              .replace('###NETWORK_IDENTIFIER###', state.wallets[wallet.managerWalletAddress].network.identifier)
          networkHandler = new Contract(apiEndpoint, Vue.prototype.$g('eth'))// Do behind the scenes work
          networkHandler.transactionsHistorical(wallet).then((headTransactions) => {
            // Create a new transaction array
            const transactions = Object.assign({}, wallet.transactions, headTransactions)
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
          break
        case 'eth':
          apiEndpoint = state.eth.activeApiEndpoint
              .replace('###NETWORK_IDENTIFIER###', wallet.network.identifier)
          networkHandler = new Eth(apiEndpoint, Vue.prototype.$g('eth'))
          // Do behind the scenes work
          networkHandler.transactionsHistorical(wallet).then((headTransactions) => {
            // Create a new transaction array
            const transactions = Object.assign({}, wallet.transactions, headTransactions)
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
          break
      }
    })
  },
  getLiveWallet({commit, state }, wallet) {
    let apiEndpoint, networkHandler
    return new Promise((resolve) => {
      commit('setLoading', {
        t: 'page',
        v: true,
        m: 'wallet.message.checking_wallet_status'
      }, { root: true })
      switch (wallet.type) {
        case 'aen':
          networkHandler = new Aen(
              state.aen.activeApiEndpoint,
              Vue.prototype.$g('aen')
          )
          networkHandler.getLiveWallet(wallet).then((response) => {
            resolve(response)
          })
          .finally(() => { commit('setLoading', {
            t: 'page',
            v: false
          }, { root: true }) })
          break
        case 'btc':
          networkHandler = new Btc(state.btc.activeApiEndpoint, Vue.prototype.$g('btc'))
          networkHandler.getLiveWallet(wallet).then((response) => {
            resolve(response)
          })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
        case 'contract':
          networkHandler = new Contract(
            state.eth.activeApiEndpoint
          )
          networkHandler.getLiveWallet(wallet).then((response) => {
            resolve(response)
          })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
        case 'eth':
          apiEndpoint = state.eth.activeApiEndpoint
              .replace('###NETWORK_IDENTIFIER###', wallet.network.identifier)
          networkHandler = new Eth(apiEndpoint, Vue.prototype.$g('eth'))
          networkHandler.getLiveWallet(wallet).then((response) => {
            resolve(response)
          })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
      }
    })
  },
  load({state, commit, dispatch}, options) {
    const typeRef = options.type[0].toUpperCase() + options.type.slice(1)
    console.debug('Wallet Store: Load (' + typeRef + ')')
    return new Promise((resolve) => {
      const wallet = {
        onChain: options.onChain || false,
        name: options.name,
        balance: options.balance || 0,
        balanceLastSynced: options.balanceLastSynced || 1,
        transactions: options.transactions || {},
        transactionsLastSynced: options.transactionsLastSynced || 1,
        type: options.type
      }

      let apiEndpoint, networkHandler
      switch (typeRef) {
        case 'Aen':
          networkHandler = new Aen(
              state.aen.activeApiEndpoint,
              Vue.prototype.$g('aen')
          )
          networkHandler.accountLoad(options).then((accountObject) => {
            options.account = accountObject
            networkHandler
              .walletLoad(options)
              .then((walletObject) => {
                Object.assign(wallet, walletObject)
                // wallet.onChain = networkHandler.getLiveWallet(options)
                if(options.main === true) {
                  commit('set'+typeRef+'Property', {
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

        case 'Btc':
          networkHandler = new Btc(state.btc.activeApiEndpoint, Vue.prototype.$g('btc'))
          networkHandler.walletLoad(options).then((walletObject) => {
            Object.assign(wallet, walletObject)
            dispatch('security/monitorWallet', wallet, {root:true})
            delete wallet.credentials
            commit('setWallet', wallet)
            resolve(wallet)
          })
          break

        case 'Contract':
          networkHandler = new Contract(
            state.eth.activeApiEndpoint
          )
          networkHandler.walletLoad(options).then((walletObject) => {
            Object.assign(wallet, walletObject)
            commit('setWallet', wallet)
            resolve(wallet)
          })
          break

        case 'Eth':
         apiEndpoint = state.eth.activeApiEndpoint
              .replace('###NETWORK_IDENTIFIER###', options.network.identifier)
          networkHandler = new Eth(apiEndpoint, Vue.prototype.$g('eth'))
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
        transactions: {},
        transactionsLastSynced: false,
        type: options.type
      }
      let apiEndpoint, networkHandler
      switch (options.type) {
        case 'aen':
          networkHandler = new Aen(
              state.aen.activeApiEndpoint,
              Vue.prototype.$g('aen')
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
          networkHandler = new Btc(state.btc.activeApiEndpoint, Vue.prototype.$g('btc'))
          networkHandler.walletNew(options).then((walletObject) => {
            Object.assign(wallet, walletObject)
            dispatch('security/monitorWallet', wallet, {root:true})
            delete wallet.credentials
            commit('setWallet', wallet)
            resolve(wallet)
          })
          break

        case 'eth':
          apiEndpoint = state.eth.activeApiEndpoint
              .replace('###NETWORK_IDENTIFIER###', options.network.identifier)
          networkHandler = new Eth(apiEndpoint, Vue.prototype.$g('eth'))
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
      let apiEndpoint, networkHandler

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
            state.aen.activeApiEndpoint,
              Vue.prototype.$g('aen')
          )
          networkHandler.transfer(options).then((transfer) => {
            resolve(transfer)
          })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
        case 'btc':
          networkHandler = new Btc(state.btc.activeApiEndpoint, Vue.prototype.$g('btc'))
          networkHandler.transfer(options).then((transfer) => {
            resolve(transfer)
          })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
        case 'contract':
          apiEndpoint = state.eth.activeApiEndpoint
              .replace('###NETWORK_IDENTIFIER###', options.transfer.managerWallet.network.identifier)
          networkHandler = new Contract(apiEndpoint, Vue.prototype.$g('eth'))
          networkHandler.transfer(options).then((transfer) => {
            resolve(transfer)
          })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
        case 'eth':
          apiEndpoint = state.eth.activeApiEndpoint
              .replace('###NETWORK_IDENTIFIER###', options.source.network.identifier)
          networkHandler = new Eth(apiEndpoint, Vue.prototype.$g('eth'))
          networkHandler.transfer(options).then((transfer) => {
            resolve(transfer)
          })
              .finally(() => { commit('setLoading', {
                t: 'page',
                v: false
              }, { root: true }) })
          break
      }
    })
  },
  async pingNetworkApiNode({ commit, state }, network) {
    console.debug('Wallet Store: Query API Node ('+network+')')
    const scanStart = new Date()
    const typeRef = network[0].toUpperCase() + network.slice(1)
    // ### SYNCHRONOUS CODE ###
    const height = await new typeRef(state[network].activeApiEndpoint, Vue.prototype.$g(network)).getHeight()
    const scanTime = new Date() - scanStart
    commit('set' + typeRef + 'Property', {
      key: 'apiPing',
      value: scanTime
    })
    commit('set' + typeRef + 'Property', {
      key: 'apiHeight',
      value: height
    })
    return scanTime
  },
  /**
     * Cycle through all available API nodes, testing how long it takes to get information on
     * the first block. Choose node with lowest ping
     *
     * @param {*} context
     */
  async rankApiNodes({ commit, state }) {
    console.debug('Wallet Store: Rank API Nodes')

    const aenApiEndpoints = Vue.prototype.$g('aen.api_endpoints')
    const apiCount = aenApiEndpoints.length


    // Test function encapsulate for variable scoping and asynchronous calling
    const check = function (currentRound) {
      const position = currentRound
      const thisAddress = aenApiEndpoints[position].address + Vue.prototype.$g('aen.api_endpoint_height')
      aenApiEndpoints[position].scanStart = new Date()

      // Perform the actual call
      this.$axios
        .$get(thisAddress)
        .then(() => {
          // Calculate ping time, output the response when in debug mode to satisfy linter
          aenApiEndpoints[position].scanEnd = new Date()
          aenApiEndpoints[position].scanTime = aenApiEndpoints[position].scanEnd - aenApiEndpoints[position].scanStart

          // If the test beats current score, set as endpoint to use
          if (aenApiEndpoints[position].scanTime < state.aen.apiPing) {
            console.debug('Updating AEN API endpoint to: ' + aenApiEndpoints[position].address)
            commit('setAenProperty', {
              key: 'activeApiEndpoint',
              value: aenApiEndpoints[position].address
            })
            commit('setAenProperty', {
              key: 'apiPing',
              value: aenApiEndpoints[position].scanTime
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
  setEthProperty(state, options) {
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
