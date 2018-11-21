import { BlockchainHttp } from 'chain-js-sdk'
import Vue from 'vue'
import generator from 'generate-password'

export const initialState = {
	contacts: [],
	account: {
		network: {},
		address: '',
		name: 'aen-wallet',
		private_key: '',
		wallet_private_key: '',
		password: '',
		publicly_accessible: false
	},
	notification: {
		show: false,
		type: 'success',
		message: 'placeholder',
		timeout: 6000
	},
	settings: {
		local_node: true
	},
	meta: {
		mode: 'web',
		environment: 'prod',
		remember_user: false,
		wallet_present: false
	},
	electron: {
		docker_present: false
	},
	internal: {
		// Array used for storing ping ranking for external api nodes
		api_endpoint: false,
		api_ping: 9999,
		busy: {
			global: true,
			router: true,
			page: false,
			// Used to trace interface blocking through VueX history
			message: ''
		},
		block_height: 0,
		block_score: 0
	}
}

export const state = () => (initialState)

export const getters = {
	notificationState: state => {
		return state.notification.show
	},
	booting: state => { return state.internal.busy.global },
	environment: state => { return state.meta.environment },
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
	gen_password (context) {
		var password = generator.generate({
			length: 50,
			numbers: true,
			symbols: true
		})
		context.commit('setPassword', password)
	},
	rank_api_nodes (context) {
		console.debug('F:RAN:Rank API Nodes')
		// Get list of hardcoded endpoints for possible use
		var apiEndpoints = Vue.prototype.$g('api_endpoints')
		var stateContext = context

		// Encapsulate the function for variable scoping
		var check = function (currentRound) {
			var position = currentRound
			var thisAddress = apiEndpoints[position].address + '/block/1'
			apiEndpoints[position].scanStart = new Date()
			var lowestPing = 9999
			this.$axios.$get(thisAddress)
				.then((response) => {
					console.debug(response)
					apiEndpoints[position].scanEnd = new Date()
					apiEndpoints[position].scanTime = apiEndpoints[position].scanEnd - apiEndpoints[position].scanStart
					console.debug('RAN: Scan for ' + thisAddress + ' took ' + apiEndpoints[position].scanTime + 'ms')
					if (apiEndpoints[position].scanTime < lowestPing) {
						console.debug('RAN: Setting new API endpoint')
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

		// Start the ranking
		for (var currentRound = 0; apiEndpoints.length > currentRound; currentRound++) {
			check(currentRound)
		}
	},
	update_network_information (context) {
		console.debug('F:UNI:Update Network Information. Using ' + context.state.internal.api_endpoint + ' as API endpoint')

		// Prepare basiuc services for use
		let apiEndpoint = context.state.internal.api_endpoint
		if (!apiEndpoint) { return }

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
	reset (state) {
		Object.keys(state).forEach(key => {
			Object.assign(state[key], initialState[key])
		})
	},
	setAccountStatus (state, status) {
		state.meta.wallet_present = status
	},
	setEnvironment (state, environmentName) {
		state.meta.environment = environmentName
	},
	setWallet (state, wallet) {
		state.meta.wallet_present = true
		state.account.wallet_private_key = wallet.encryptedPrivateKey.encryptedKey
		state.account.address = wallet.address.address
	},
	setAccount (state, account) {
		state.account.public_key = account.publicKey
		state.account.private_key = account.privateKey
	},
	setPassword (state, password) {
		state.account.password = password
	},
	setRememberUser (state, value) {
		state.meta.remember_user = value
	},
	/**
   * t = type
   * v = boolean conditions
   * m = message
   * @param {*} state
   * @param {*} loadingObject
   */
	setLoading (state, loadingObject) {
		state.internal.busy[loadingObject.t] = loadingObject.v
		if (loadingObject.hasOwnProperty('m')) {
			state.internal.busy.message = loadingObject.m
		}
	},
	setRouterLoading (state, value) {
		state.internal.router_loading = value
	},
	/**
   * Address Book related information
   */
	addContact (state, contact) {
		state.contacts.push(contact)
	},
	deleteContact (state, contact) {
		const indexPosition = state.contacts.findIndex(i => i === contact)
		state.contacts.splice(indexPosition, 1)
	},
	editContact (state, changeObjects) {
		const indexPosition = state.contacts.findIndex(i => i === changeObjects.original)
		state.contacts.splice(indexPosition, 1)
		state.contacts.push(changeObjects.updated)
	},
	setApiEndpoint (state, value) {
		state.internal.api_endpoint = value
	},
	setPingTime (state, value) {
		state.internal.api_ping = value
	},
	setCurrentApi (state, payload) {
		state.internal.api_endpoint = payload.address
		state.internal.api_ping = payload.scanTime
	},
	setPreferredNode (state, address) {
		state.internal.preferredNode = address
	},
	setActiveNodeList (state, nodeList) {
		state.internal.nodeList = nodeList
	},
	setNetwork (state, network) {
		state.account.network = network
	},
	setBlockHeight (state, blockHeight) {
		state.internal.block_height = blockHeight
	},
	setBlockScore (state, blockScore) {
		state.internal.block_score = blockScore
	},
	dismissNotification (state) {
		state.notification.show = false
	},
	showNotification (state, inputObject) {
		inputObject.show = true
		state.notification = inputObject
	},
	setIncomingTransactions (state, transactions) {
		state.transactions.incoming = transactions
	},
	setUnconfirmedTransactions (state, transactions) {
		state.transactions.unconfirmed = transactions
	},
	setOutgoingTransactions (state, transactions) {
		state.transactions.outgoing = transactions
	},
	setNotificationStatus (state, status) {
		state.notification.show = status
	},
	setDeviceSetting (state, input) {
		state.settings[input.key] = input.value
	},
	setElectronProperty (state, input) {
		state.electron[input.key] = input.value
	},
	setAccountProperty (state, input) {
		console.log('Setting Account property')
		console.log(input)
		state.account[input.key] = input.value
	},
	setMosaics (state, input) {
		state.mosaics = input
	},
	setAppMode (state, mode) {
		state.meta.mode = mode
	}
}
