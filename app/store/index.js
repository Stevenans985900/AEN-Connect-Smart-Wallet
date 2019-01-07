import {
    BlockchainHttp
} from 'chain-js-sdk'
import Vue from 'vue'
import generator from 'generate-password'

export const initialState = {
    contacts: [],
    wallets: {},
    activeWallet: {
        network: {},
        address: '',
        name: '',
        accountPrivateKey: '',
        privateKey: '',
        password: '',
        onChain: false
    },
    notification: {
        show: false,
        type: 'success',
        message: 'message_placeholder',
        timeout: 6000
    },
    settings: {
        local_node: true
    },
    meta: {
        mode: 'web',
        environment: 'prod',
        rememberUser: false,
        wallet_present: false
    },
    electron: {
        docker_present: false
    },
    internal: {
        // Array used for storing ping ranking for external api nodes
        activeApiEndpoint: false,
        activeApiPing: 9999,
        busy: {
            global: true,
            router: true,
            page: false,
            message: ''
        },
        blockHeight: 0,
        blockScore: 0
    }
}

export const state = () => (initialState)

export const getters = {
    notificationState: state => {
        return state.notification.show
    },
    booting: state => {
        return state.internal.busy.global
    },
    environment: state => {
        return state.meta.environment
    },
    loading: state => {
        if (
            state.internal.busy.global === true ||
            state.internal.busy.router === true ||
            state.internal.busy.page === true) {
            return true
        }
    }
}

export const actions = {
    gen_password(context) {
        var password = generator.generate({
            length: 50,
            numbers: true,
            symbols: true
        })
        context.commit('setPassword', password)
    },
    /**
     * Cycle through all available API nodes, testing how long it takes to get information on
     * the first block. Choose node with lowest ping
     * 
     * @param {*} context 
     */
    rankApiNodes(context) {
        console.debug('F:RAN:Rank API Nodes')
        var apiEndpoints = Vue.prototype.$g('api_endpoints')
        var stateContext = context

        // Test function encapsulate for variable scoping and asynchronous calling
        var check = function (currentRound) {
            var position = currentRound
            var thisAddress = apiEndpoints[position].address + Vue.prototype.$g('api_endpoint_test_uri')
            apiEndpoints[position].scanStart = new Date()
            var lowestPing = 9999

            // Perform the actual call
            this.$axios.$get(thisAddress)
                .then((response) => {

                    // Calculate pint time
                    console.debug(response)
                    apiEndpoints[position].scanEnd = new Date()
                    apiEndpoints[position].scanTime = apiEndpoints[position].scanEnd - apiEndpoints[position].scanStart

                    // If the test beats current score, set as endpoint to use
                    if (apiEndpoints[position].scanTime < lowestPing) {
                        console.debug('RAN: Setting new API endpoint to: ' + apiEndpoints[position].address)
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
    },
    /**
     * Gets some generic (non wallet specific) related blockchain information
     * 
     * @param {*} context 
     */
    updateGenericNetworkInformation(context) {
        console.debug('F:UGNI:Update Network Information. Using ' + context.state.internal.activeApiEndpoint + ' as API endpoint')

        // Prepare basic services for use
        let apiEndpoint = context.state.internal.activeApiEndpoint
        if (!apiEndpoint) {
            return
        }

        let blockchainHttp = new BlockchainHttp(apiEndpoint)

        // Get the network height
        blockchainHttp.getBlockchainHeight()
            .subscribe(height => {
                if (height.lower !== context.state.internal.block_height) {
                    console.debug('UNI:Blockchain Height is ' + height.lower + '/' + height.higher + ' (lower/higher)')
                    context.commit('setBlockHeight', height.lower)
                }
            })

        // Get current blockchain score
        blockchainHttp.getBlockchainScore()
            .subscribe(score => {
                if (score.scoreLow.lower !== context.state.internal.block_score) {
                    console.debug('UNI:Blochain Score is ' + score.scoreLow.lower + '/' + score.scoreHigh.higher + ' (lower/higher)')
                    context.commit('setBlockScore', score.scoreLow.lower)
                }
            })
    }
}

export const mutations = {
    reset(state) {
        Object.keys(state).forEach(key => {
            Object.assign(state[key], initialState[key])
        })
    },
    setAccountStatus(state, status) {
        state.meta.wallet_present = status
    },
    setEnvironment(state, environmentName) {
        state.meta.environment = environmentName
    },
    // Setting a AEN wallet to main context
    setActiveWallet(state, wallet) {
        state.meta.walletPresent = true
        state.activeWallet.privateKey = wallet.encryptedPrivateKey.encryptedKey
        state.activeWallet.address = wallet.address.address

        // Check whether the wallet exists in
        if (!state.wallets.hasOwnProperty(state.activeWallet.address)) {
            state.wallets[state.activeWallet.address] = {
                type: 'aen',
                privateKey: state.activeWallet.privateKey,
                accountPrivateKey: state.activeWallet.accountPrivateKey,
                password: state.activeWallet.password,
                network: state.activeWallet.network
            }
        }

    },
    setAccount(state, account) {
        state.activeWallet.public_key = account.publicKey
        state.activeWallet.private_key = account.privateKey
    },
    setPassword(state, password) {
        state.activeWallet.password = password
    },
    setRememberUser(state, value) {
        state.meta.remember_user = value
    },
    /**
     * t = type
     * v = boolean conditions
     * m = message
     * @param {*} state
     * @param {*} loadingObject
     */
    setLoading(state, loadingObject) {
        state.internal.busy[loadingObject.t] = loadingObject.v
        if (loadingObject.hasOwnProperty('m')) {
            state.internal.busy.message = loadingObject.m
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
        state.internal.api_endpoint = value
    },
    setPingTime(state, value) {
        state.internal.api_ping = value
    },
    setCurrentApi(state, payload) {
        state.internal.api_endpoint = payload.address
        state.internal.api_ping = payload.scanTime
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
    setElectronProperty(state, input) {
        state.electron[input.key] = input.value
    },
    setAccountProperty(state, input) {
        state.activeWallet[input.key] = input.value
    },
    setMosaics(state, input) {
        state.mosaics = input
    },
    setAppMode(state, mode) {
        state.meta.mode = mode
    }
}