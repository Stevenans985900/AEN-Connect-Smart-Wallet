<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>

      <!-- Initial setup -->
      <v-card>
        <v-card-title class="headline">Welcome to the AENChain Wallet (local)!</v-card-title>
        <v-card-text>
          <p>You are receiving this message because you don't yet have a wallet setup, please choose from the options below</p>
          <p>
            <v-btn color="success" v-on:click="newAccount = !newAccount">New Wallet</v-btn>
            <v-btn color="info" v-on:click="existingAccount = !existingAccount">Existing Wallet</v-btn>
          </p>

          <!-- Setup wallet from existing account -->
          <v-card v-if="newAccount">
            <v-card-text>
              <v-layout row wrap>

                <v-flex xs12>
                  <v-select
                    :items="availableNetworks"
                    v-model="network"
                    return-object
                    item-text="name"
                    label="Network"
                  ></v-select>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    label="Wallet Name"
                    v-model="walletName"
                    :rules="[walletRules.required, walletRules.min]"
                    required
                    counter
                    placeholder="AEN Wallet"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    label="Wallet Password"
                    v-model="walletPassword"
                    append-icon="add"
                    @click:append="regenWalletPassword"
                    :rules="[passwordRules.required, passwordRules.min]"
                    required
                    counter
                    placeholder="excRb3Q$c7Mf5SPGa3PfnTmBKHHFdv3G!#^cjtZM!EJ"
                  ></v-text-field>
                </v-flex>

                <v-btn v-on:click="createAccount">Create</v-btn>
              </v-layout>
            </v-card-text>
          </v-card>

          <!-- Setup wallet from existing account -->
          <v-card v-if="existingAccount">
            <v-card-text>
              <h2>Existing Account</h2>
            </v-card-text>
          </v-card>

        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>

export default {
	data () {
		return {
			newAccount: false,
			existingAccount: false,
			walletRules: {
				required: value => !!value || 'Required.',
				min: v => v.length >= 6 || 'Min 6 Characters'
			},
			passwordRules: {
				required: value => !!value || 'Required.',
				min: v => v.length >= 40 || 'Min 40 characters'
			},
			validity: {}
		}
	},
	created: function () {
		console.log('P:I:Index Page Started')

		// Check if there is a network set and use the first available
		if(!this.network) {
			console.log('I:Setting a default network to first available')
			this.network = this.availableNetworks[0]
		}

		// Only start once global loading finished
		var preperationInterval = setInterval(function () {
			if (this.$store.getters.booting === false) {
				if (this.$store.state.meta.account_present === true) {
					this.$nuxt.$router.replace({ path: '/dashboard' })
				}

				clearInterval(preperationInterval)
				this.$store.commit('setLoading', { 't': 'router', 'v': false })
			}
		}.bind(this), 2000)

		// If there is no default password, generate one for the user
		if (this.$store.state.account.password === false) {
			this.regenWalletPassword()
		}
	},
	computed: {
		network: {
			get: function () { return this.$store.state.account.network },
			set: function (inputValue) { this.$store.commit('setNetwork', inputValue) }
		},
		availableNetworks () { return this.$g('available_networks') },
		walletName: {
			get: function () { return this.$store.state.account.name },
			set: function (inputValue) { this.$store.commit('setAccountProperty', { key: 'name', value: inputValue }) }
		},
		walletNetwork: {
			get: function () { return this.$store.state.account.network },
			set: function (inputValue) { this.$store.commit('setAccountProperty', { key: 'name', value: inputValue }) }
		},
		walletPassword: {
			get: function () { return this.$store.state.account.password },
			set: function (inputValue) { this.$store.commit('setAccountProperty', { key: 'password', value: inputValue }) }
		}
	},
	methods: {
		/**
     * CREATE ACCOUNT
     * Set up account in initial state to be used on the blockchain
     */
		createAccount () {
			console.debug('F:CA:Create Account')
			var account = this.$account.generate_account(this.$store.state.account.network.identifier)
			var wallet = this.$account.generate_wallet(
				this.$account.account,
				this.$store.state.account.password,
				this.$store.state.account.network.byte,
				this.$store.state.account.name)

			this.$store.commit('setAccount', account)
			this.$store.commit('setWallet', wallet)

			var message = 'Your wallet has been successfully setup!'
			this.$store.commit('showNotification', { 'type': 'success', 'message': message })
			this.$nuxt.$router.replace({ path: '/dashboard' })
		},
		regenWalletPassword () {
			console.debug('F:RWP:Regen Wallet Password')
			this.$store.dispatch('gen_password')
			console.debug('RWP:Result = ' + this.$store.state.account.password)
		}
	},
	watch: {
		newAccount: function (value) {
			if (value === true) { this.existingAccount = false }
		},
		existingAccount: function (value) {
			if (value === true) { this.newAccount = false }
		}
	}
}
</script>
