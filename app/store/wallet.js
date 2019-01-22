import Vue from 'vue'
import Aen from '~/modules/network/Aen'
import Ethereum from "../modules/network/Ethereum";

export const initialState = {
    contacts: [],
    wallets: {},
    context: {
        network: {},
        address: '',
        name: '',
        accountPrivateKey: '',
        privateKey: '',
        password: '',
        onChain: false
    },
    ethereum: {
        activeApiEndpoint: '',
        activeApiPing: 9999,
        network: {}
    },
    internal: {
        walletCheckInterval: 10000,
        apiEndpointPingInterval: 30000,
        networkInformationInterval: 30000,
        // Array used for storing ping ranking for external api nodes
        activeApiEndpoint: '',
        activeApiPing: 9999,
        blockHeight: 0,
        blockScore: 0
    }
}

export const state = () => (initialState)

export const actions = {
    balance: (context, wallet) => {
        let networkHandler
        // wallet.balance = 0
        return new Promise((resolve) => {
            switch (wallet.type) {
                case 'aen':
                    networkHandler = new Aen(context.state.internal.activeApiEndpoint)
                    networkHandler.balance(wallet).then(response => {
                        context.commit('setWalletProperty', {
                            wallet: wallet,
                            key: 'balance',
                            value: response
                        })
                        resolve(wallet)
                    })
                    break
                case 'eth':
                    networkHandler = new Ethereum(context.state.ethereum.activeApiEndpoint)
                    networkHandler.balance(wallet).then(response => {
                        console.debug(response)
                        context.commit('setWalletProperty', {
                            wallet: wallet,
                            key: 'balance',
                            value: response
                        })
                        resolve(wallet)
                    })
            }

        })
    },
    checkWalletLive(context, wallet) {
        let networkHandler
        return new Promise((resolve) => {
            switch (wallet.type) {
                case 'aen':
                    networkHandler = new Aen(context.state.internal.activeApiEndpoint)
                    networkHandler.walletIsLive(wallet).then(response => {
                        resolve(response)
                    })
                    break
                case 'eth':
                    networkHandler = new Ethereum(context.state.ethereum.activeApiEndpoint)
                    networkHandler.walletIsLive(wallet).then(response => {
                        resolve(response)
                    })
                    break;
            }
        })
    },
    load(context, options) {
        console.debug('Wallet Service:Load ' + options.type)
        // var vm = this

        return new Promise((resolve) => {
            let wallet = {
                onChain: false,
                name: options.name,
                balance: 0
            }

            let account, networkHandler, walletObject
            switch (options.type) {
                case 'aen':
                    networkHandler = new Aen
                    // Do behind the scenes work
                    account = networkHandler.accountLoad(options)
                    options.accountPrivateKey = account.privateKey
                    walletObject = networkHandler.walletLoad(options)

                    // Package wallet up in to simple format for later reference
                    wallet.type = 'aen'
                    wallet.password = options.password
                    wallet.accountPrivateKey = account.privateKey
                    wallet.privateKey = walletObject.encryptedPrivateKey.encryptedKey
                    wallet.publicKey = account.publicKey
                    wallet.address = walletObject.address.address
                    wallet.network = options.network

                    // Check if the wallet is on the chain
                    wallet.onChain = networkHandler.walletIsLive(options)
                    if (options.hasOwnProperty('main')) {
                        wallet.main = true
                        context.commit('setContext', wallet)
                    }

                    context.commit('addWallet', wallet)
                    resolve(wallet)
                    break
                case 'erc20':

                case 'eth':
                    networkHandler = new Ethereum(context.state.ethereum.activeApiEndpoint)
                    networkHandler.walletLoad(options).then(walletObject => {
                        wallet.type = 'eth'
                        wallet.password = options.password
                        wallet.privateKey = walletObject.privateKey
                        wallet.address = walletObject.address
                        wallet.keystore = walletObject.encrypt(options.password)
                        wallet.network = options.network
                        context.commit('addWallet', wallet)

                        networkHandler.balance(wallet).then(response => {
                            console.debug(response)
                            context.commit('setWalletProperty', {
                                wallet: wallet,
                                key: 'balance',
                                value: response
                            })
                            resolve(wallet)
                        })

                        networkHandler.walletIsLive(wallet).then(response => {
                            context.commit('setWalletProperty', {
                                wallet: wallet,
                                key: 'balance',
                                value: response
                            })
                            resolve(wallet)
                        })

                        resolve(wallet)
                    })
                    break;
            }
        })
    },
    new(context, options) {
        console.debug('Wallet Service:New ' + options.type)

        return new Promise((resolve) => {
            let wallet = {
                onChain: false,
                name: options.name,
                balance: 0
            }

            let account, networkHandler, walletObject
            switch (options.type) {
                case 'aen':
                    networkHandler = new Aen(context.state.internal.activeApiEndpoint)
                    // Do behind the scenes work
                    account = networkHandler.accountNew(options)
                    options.accountPrivateKey = account.privateKey
                    walletObject = networkHandler.walletLoad(options)

                    // Package wallet up in to simple format for later reference
                    wallet.type = 'aen'
                    wallet.password = options.password
                    wallet.accountPrivateKey = account.privateKey
                    wallet.privateKey = walletObject.encryptedPrivateKey.encryptedKey
                    wallet.publicKey = account.publicKey
                    wallet.address = walletObject.address.address
                    wallet.network = options.network

                    // Check if the wallet is on the chain
                    if (options.hasOwnProperty('main') && options.main === true) {
                        wallet.main = true
                        context.commit('setContext', wallet)
                    }
                    context.commit('addWallet', wallet)
                    resolve(wallet)
                    break
                case 'eth':
                    networkHandler = new Ethereum(context.state.ethereum.activeApiEndpoint)
                    walletObject = networkHandler.walletNew(options)
                    wallet.address = walletObject.address
                    wallet.privateKey = walletObject.privateKey
                    wallet.keystore = walletObject.encrypt(options.password)
                    wallet.network = options.network
                    wallet.type = 'eth'
                    wallet.password = options.password
                    context.commit('addWallet', wallet)
                    resolve(wallet)
                    break
            }
        })
    },
    transfer(context, options) {
        return new Promise((resolve) => {
            let networkHandler, transfer
            switch (options.source.type) {
                case 'aen':
                    networkHandler = new Aen(context.state.internal.activeApiEndpoint)
                    break
                case 'eth':
                    networkHandler = new Ethereum(context.state.ethereum.activeApiEndpoint)
            }
            transfer = networkHandler.transfer(options)
            resolve(transfer)
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
        var apiEndpoints = Vue.prototype.$g('aen.api_endpoints')
        var stateContext = context

        // Test function encapsulate for variable scoping and asynchronous calling
        var check = function (currentRound) {
            var position = currentRound
            var thisAddress = apiEndpoints[position].address + Vue.prototype.$g('aen.api_endpoint_test_uri')
            apiEndpoints[position].scanStart = new Date()
            var lowestPing = 9999

            // Perform the actual call
            this.$axios.$get(thisAddress)
                .then((response) => {

                    // Calculate ping time, output the response when in debug mode to satisfy linter
                    console.debug(response)
                    apiEndpoints[position].scanEnd = new Date()
                    apiEndpoints[position].scanTime = apiEndpoints[position].scanEnd - apiEndpoints[position].scanStart

                    // If the test beats current score, set as endpoint to use
                    if (apiEndpoints[position].scanTime < lowestPing) {
                        console.debug('Updating AEN API endpoint to: ' + apiEndpoints[position].address)
                        lowestPing = apiEndpoints[position].scanTime
                        stateContext.commit('setApiEndpoint', apiEndpoints[position].address)
                        stateContext.commit('setPingTime', lowestPing)
                    }
                })
                .catch((error) => {
                    console.log('Node offline: ' + thisAddress)
                    console.debug(error)
                })
        }.bind(this)

        // Start performing the checks asynchronously
        for (var currentRound = 0; apiEndpoints.length > currentRound; currentRound++) {
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
    addWallet(state, wallet) {
        state.wallets[wallet.address] = wallet
        if(wallet.main === true && wallet.type === 'aen') {
            state.context = wallet
        }
    },
    setEthereumProperty(state, options) {
        state.ethereum[options.key] = options.value
    },
    setWalletProperty(state, options) {
        state.wallets[options.wallet.address][options.key] = options.value
        if(options.wallet.main === true && options.wallet.type === 'aen') {
            state.context = options.wallet
        }
    },
    setProperty(state, options) {
        state.wallets[options.address][options.key] = options.value
    },
    setContext(state, wallet) {
        state.context = wallet
    },
    setPassword(state, password) {
        state.activeWallet.password = password
    },
    setRememberUser(state, value) {
        state.meta.remember_user = value
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
        state.internal.activeApiPing = value
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
    setBlockHeight(state, blockHeight) {
        state.internal.block_height = blockHeight
    },
    setBlockScore(state, blockScore) {
        state.internal.block_score = blockScore
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