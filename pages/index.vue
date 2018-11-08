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

          <!-- Setup wallet for new account -->
					<v-card v-if="newAccount">
            <v-card-text>
              <v-layout row wrap>
								<v-form ref="form" v-model="valid">
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

									<v-flex xs12>
										<v-checkbox
								      v-model="rememberMe"
								      label="Remember Me"
								    ></v-checkbox>
	                </v-flex>

	                <v-btn
										@click="createAccount"
										:disabled="!valid"
									>Create</v-btn>
								</v-form>
              </v-layout>
            </v-card-text>
          </v-card>

          <!-- Setup wallet from existing account -->
					<v-card v-if="existingAccount">
						<v-card-text>
							<v-layout row wrap>
								<v-form ref="form" v-model="valid">

									<!-- Restore from file backup -->
									<v-flex xs12>
										<upload-btn
											:fileChangedCallback="backupUploaded"
											title="Select Backup File"
										>
											<template slot="icon">
										    <v-icon>attach_file</v-icon>
										  </template>
										</upload-btn>
									</v-flex>

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
											required
										></v-text-field>
									</v-flex>

									<v-flex xs12>
										<v-text-field
											label="Private Key"
											v-model="privateKey"
											required
										></v-text-field>
									</v-flex>

									<v-flex xs12>
										<v-text-field
											label="Wallet Password"
											v-model="walletPassword"
											required
										></v-text-field>
									</v-flex>

									<v-flex xs12>
										<v-checkbox
								      v-model="rememberMe"
								      label="Remember Me"
								    ></v-checkbox>
	                </v-flex>

									<v-btn v-on:click="loadWallet">Create</v-btn>
								</v-form>
							</v-layout>
						</v-card-text>
          </v-card>

        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { SimpleWallet } from 'chain-js-sdk'
import UploadButton from 'vuetify-upload-button'
import fs from 'fs'

export default {
	components: {
		'upload-btn': UploadButton
	},
	data () {
		return {
			valid: false,
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
		console.debug('P:I:Index Page Started')

		// Check if there is a network set and use the first available
		if(Object.keys(this.$store.state.account.network).length === 0) {
			console.debug('I:Setting a default network to first available')
			this.network = this.availableNetworks[0]
		}

		// Only start once global loading finished
		var preperationInterval = setInterval(function () {
			if (this.$store.getters.booting === false) {
				if (this.$store.state.account.private_key === true) {
					console.debug('I:User has saved wallet present, redirecting to dashboard')
					this.$nuxt.$router.replace({ path: '/dashboard' })
				} else {

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
		account () { return this.$account.$store.state },
		network: {
			get: function () { return this.$store.state.account.network },
			set: function (inputValue) {
				this.$store.commit('setNetwork', inputValue)
			}
		},
		availableNetworks () { return this.$g('available_networks') },
		rememberMe: {
			get: function () { return this.$store.state.meta.remember_user },
			set: function (inputValue) { this.$store.commit('setRememberUser', inputValue ) }
		},
		walletName: {
			get: function () { return this.$store.state.account.name },
			set: function (inputValue) { this.$store.commit('setAccountProperty', { key: 'name', value: inputValue }) }
		},
		walletPassword: {
			get: function () { return this.$store.state.account.password },
			set: function (inputValue) { this.$store.commit('setAccountProperty', { key: 'password', value: inputValue }) }
		},
		privateKey: {
			get: function () { return this.$store.state.account.private_key },
			set: function (inputValue) { this.$store.commit('setAccountProperty', { key: 'private_key', value: inputValue }) }
		}
	},
	methods: {
		/**
     * CREATE ACCOUNT
     * Set up account in initial state to be used on the blockchain
     */
		createAccount () {
			console.debug('F:CA:Create Account')
			this.$account.generate_account(this.$store.state.account.network.identifier)
			this.$account.open_wallet(
				this.$store.state.account.name,
				this.$store.state.account.password,
				this.$account.$store.state.account.privateKey,
				this.$store.state.account.network.byte,
			)

			// Check if wallet creation was successful
			if(this.$account.$store.state.wallet instanceof SimpleWallet) {
				console.debug('CA:Wallet successfully generated')

				if(this.$store.state.meta.remember_user === true) {
					console.debug('CA:Remember me option selected, saving details to store')
					this.$store.commit('setAccount', this.$account.$store.state.account)
					this.$store.commit('setWallet', this.$account.$store.state.wallet)
				} else {
					this.$store.commit('setAccountStatus', true)
				}
				var message = 'Your wallet has been successfully setup!'
				this.$store.commit('showNotification', { 'type': 'success', 'message': message })
				this.$nuxt.$router.replace({ path: '/dashboard' })
			} else {
				var message = 'Something went wrong during wallet creation'
				this.$store.commit('showNotification', { 'type': 'error', 'message': message })
			}
		},
		loadWallet () {
			console.debug('F:LW:Load Wallet')
			this.$account.regenerate_account(
				this.$store.state.account.private_key,
				this.$store.state.account.network.byte
			)
			this.$account.open_wallet(
				this.$store.state.account.name,
				this.$store.state.account.password,
				this.$store.state.account.private_key,
				this.$store.state.account.network.byte
			)
			// Load the wallet key in to state storage for reuse
			this.$store.commit(
				'setAccountProperty',
				{
					"key": "wallet_private_key",
					"value": this.$account.$store.state.wallet.encryptedPrivateKey.encryptedKey})

			// Check if wallet creation was successful
			if(this.$account.$store.state.wallet instanceof SimpleWallet) {
				console.debug('CA:Wallet successfully generated')
				if(this.rememberMe === true) {
					console.debug('CA:Remember me option selected, saving details to store')
					this.$store.commit('setAccount', this.$account.$store.state.account)
					this.$store.commit('setWallet', this.$account.$store.state.wallet)
				} else {
					this.$store.commit('setAccountStatus', true)
				}
				var message = 'Your wallet has been successfully regenerated!'
				this.$store.commit('showNotification', { 'type': 'success', 'message': message })
				this.$nuxt.$router.replace({ path: '/dashboard' })
			} else {
				var message = 'Something went wrong during wallet regeneration'
				this.$store.commit('showNotification', { 'type': 'error', 'message': message })
			}

		},
		regenWalletPassword () {
			console.debug('F:RWP:Regen Wallet Password')
			this.$store.dispatch('gen_password')
			console.debug('RWP:Result = ' + this.$store.state.account.password)
		},
		backupUploaded (file) {
			console.debug('F:BU:Backup Uploaded')
			fs.readFile(file.path, "utf8",  (err, data)  => {
				if (err) throw err
				try {
					const walletInformation = JSON.parse(data)
					this.$store.commit('setAccountProperty', { key: 'name', value: walletInformation.name })
					this.$store.commit('setAccountProperty', { key: 'private_key', value: walletInformation.accountPrivateKey })

					// Get the proper network definition based on the identifier byte
					const network = this.availableNetworks.filter(obj => {
						return obj.byte === walletInformation.networkIdentifierByte
					})[0]
					this.$store.commit('setAccountProperty', { key: 'network', value: network })

					var message = 'Backup loaded, please enter your password in the provided field'
					this.$store.commit('showNotification', { 'type': 'info', 'message': message })

		    } catch(e) {
					var message = 'The file you uploaded appears invalid, please make sure it is a wallet backup'
					this.$store.commit('showNotification', { 'type': 'error', 'message': message })
		    }
			})

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
