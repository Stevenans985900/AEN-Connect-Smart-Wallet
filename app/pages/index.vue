<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>

      <!-- Initial setup -->
      <v-card>
        <v-card-title class="headline">Welcome to the AENChain Wallet ({{ network.name }})!</v-card-title>
        <v-card-text>
          <p>You are receiving this message because you don't yet have a wallet setup, please choose from the options below</p>
          <p>
            <v-btn color="success" v-on:click="newAccount = !newAccount">New Wallet</v-btn>
            <v-btn color="info" v-on:click="existingAccount = !existingAccount">Existing Wallet</v-btn>
					</p>
					<hr />

					<v-layout>
						<v-flex xs12 md6 >
							<!-- Setup wallet for new account -->
							<v-card v-if="newAccount" class="text-xs-center">
		            <v-card-text>
		              <v-layout row wrap>

										<v-form ref="form" v-model="valid" @submit.prevent="onSubmit" class="full-width">
										    <v-select
													v-if="multipleNetworks"
			                    :items="availableNetworks"
			                    v-model="network"
			                    return-object
			                    item-text="name"
			                    label="Network"
			                  ></v-select>
			                  <v-text-field
			                    label="Wallet Name"
			                    v-model="walletName"
			                    :rules="[walletRules.required, walletRules.min]"
			                    required
			                    placeholder="AEN Wallet">
			                  </v-text-field>
			                  <v-text-field
			                    label="Wallet Password"
			                    v-model="walletPassword"
			                    :append-icon="showPassword ? 'visibility_off' : 'visibility'"
													:type="showPassword ? 'text' : 'password'"
			                    @click:append="showPassword = !showPassword"
			                    :rules="[passwordRules.required, passwordRules.min]"
			                    required
			                    counter
			                  ></v-text-field>
												<v-checkbox
										      v-model="rememberMe"
										      label="Remember Me"
										    ></v-checkbox>
												<vue-recaptcha v-if="environment === 'Production'"
								          ref="recaptcha"
								          @verify="createAccount"
								          :sitekey="googleCaptchaKey">
								        </vue-recaptcha>
												<v-btn v-else
													@click="createAccount"
												>Create Account</v-btn>
										</v-form>

		              </v-layout>
		            </v-card-text>
		          </v-card>

		          <!-- Setup wallet from existing account -->
							<v-card v-if="existingAccount" class="text-xs-center">
								<v-card-text>
									<v-layout row wrap>

										<v-form ref="form" v-model="valid" class="full-width">
											<upload-btn
												:fileChangedCallback="backupUploaded"
												title="Restore from file"
											>
												<template slot="icon">
											    <v-icon>attach_file</v-icon>
											  </template>
											</upload-btn>
											<v-select
		                    :items="availableNetworks"
		                    v-model="network"
		                    return-object
		                    item-text="name"
		                    label="Network"
		                  ></v-select>
											<v-text-field
												label="Wallet Name"
												v-model="walletName"
												required
											></v-text-field>
											<v-text-field
												label="Private Key"
												v-model="privateKey"
												required
											></v-text-field>
											<v-text-field
												label="Wallet Password"
												v-model="walletPassword"
												required
											></v-text-field>
											<v-checkbox
									      v-model="rememberMe"
									      label="Remember Me"
									    ></v-checkbox>
											<v-btn v-on:click="loadWallet">Create</v-btn>
										</v-form>

									</v-layout>
								</v-card-text>
		          </v-card>
						</v-flex>

						<!-- summary -->
						<v-flex xs12 md6 v-if="walletExists === true" class="text-xs-center">
							<v-card>
		            <v-card-text>
									<address-render :address="address" />
									<v-img :src="qrData" aspect-ratio="1" />

	              	<v-form ref="form" v-model="proceedValid">
											<v-checkbox
									      v-model="eulaAgree"
												:rules="[rules.required]"
												required
									    >
												<span slot="label">
														I agree to the <a href="http://aencoin.com/eula">AEN EULA</a>
												</span>
											</v-checkbox>
		              		<v-checkbox
									      v-model="backupAgree"
												:rules="[rules.required]"
												required
												label="I have backed up my wallet and understand that keeping it safe is my duty"
									    />
										<backup-wallet />
		              	<v-btn
											@click="createAccount"
											:disabled="!proceedValid"
										>Continue</v-btn>
									</v-form>
		            </v-card-text>
		          </v-card>
						</v-flex>
					</v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<style>
.full-width {
	width: 100% !important;
}
</style>
<script>
import BackupWallet from '../components/BackupWallet'
import { SimpleWallet } from 'chain-js-sdk'
import UploadButton from 'vuetify-upload-button'
import EventEmitter from 'events'
import qrCodeGenerator from 'qrcode-generator'
import VueRecaptcha from 'vue-recaptcha'
import isElectron from 'is-electron'
if (isElectron()) {
	const fs = require ('fs')
}

export default {
	components: {
		BackupWallet,
		'upload-btn': UploadButton,
		VueRecaptcha
	},
	data () {
		return {
			valid: false,
			eulaAgree: false,
			backupAgree: false,
			proceedValid: false,
			newAccount: false,
			existingAccount: false,
			showPassword: false,
			rules: {
				required: value => !!value || 'Required.'
			},
			walletRules: {
				required: value => !!value || 'Required.',
				min: v => v.length >= 6 || 'Min 6 Characters'
			},
			passwordRules: {
				required: value => !!value || 'Required.',
				min: v => v.length >= 8 || 'Min 8 characters'
			},
			validity: {}
		}
	},
	mounted: function () {
		console.debug('P:I:Index Page Started')

		if(this.environment === 'Production') {
			console.debug('I:Pulling in Google Recaptcha')
			let recaptchaScript = document.createElement('script')
			recaptchaScript.setAttribute(
				'src',
				'https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit')
			document.head.appendChild(recaptchaScript)
		}

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
		googleCaptchaKey() { return this.$g('google_recaptcha_key') },
		environment () { return this.$store.state.meta.environment },
		address () {
			if(this.$account.$store.state.wallet.hasOwnProperty('address')) {
				return this.$account.$store.state.wallet.address.address
			}
			return ''
		},
		qrData () {
			var qr = qrCodeGenerator(0, 'M')
			qr.addData(this.address)
			qr.make()
			return qr.createDataURL(5)
		},
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
		multipleNetworks () {
			if(this.$g('available_networks').length > 1) {
				return true
			}
			return false
		},
		walletExists () { return this.$store.state.meta.wallet_present },
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
		onSubmit: function () {
			this.$refs.invisibleRecaptcha.execute()
		},
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
				// this.$nuxt.$router.replace({ path: '/dashboard' })
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

			// Create the construct to handle both app / browser situations
			const fileUploadedEmitter = new EventEmitter()
			fileUploadedEmitter.on('ready', function (walletData) {
				try {
					const walletInformation = JSON.parse(walletData)
					console.debug('BU:Result')
					console.debug(walletInformation)
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
			}.bind(this))

			// Fork condition depending on the environment
			// TODO If come across more of these conditions, put them in to facade
			if (isElectron()) {
				console.debug('BU:Using local file mode')
				fs.readFile(file.path, "utf8",  (err, data)  => {
					if (err) throw err
					fileUploadedEmitter.emit('ready', data)
				})
			} else {
				console.log('BU:Using HTML file API')
				var reader = new FileReader()
				reader.readAsText(file)
				reader.onload = function(event) {
					fileUploadedEmitter.emit('ready', event.target.result)
			  }
			}
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
