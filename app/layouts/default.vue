<template>
  <v-app dark>

    <!-- NAV DRAWER -->
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
    >
      <v-list>
        <v-list-tile
          router
          :to="item.to"
          :key="i"
          v-for="(item, i) in visibleLinks"
          exact
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

				<v-list-tile exact @click="exit" v-if="appRunTime === 'app'">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Exit</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

      </v-list>
    </v-navigation-drawer>

		<!-- TOP BAR -->
    <v-toolbar fixed app>

      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
			<v-avatar
        size="24"
      >
        <img src="/logo.png" alt="avatar">
      </v-avatar>
      <v-toolbar-title class="hidden-sm-and-down" v-text="title" ></v-toolbar-title>

      <v-spacer></v-spacer>

			<!-- Environment -->
      <v-btn v-if="environment !== 'prod'" disabled>
        {{ environment }}
      </v-btn>

      <!-- Quick balance display -->
      <v-btn v-if="account.meta.balance != 0" disabled>
        Balance: {{ account.meta.balance }}
      </v-btn>

			<network-diagnostics></network-diagnostics>


			<!-- USER DROPDOWN -->
			<v-menu
        v-if="account.account.address"
        v-model="menu"
        :close-on-content-click="false"
      >
			<v-btn slot="activator" flat>
				<v-avatar size="24">
					<v-icon>account_circle</v-icon>
				</v-avatar>
			</v-btn>
				<v-card>
          <v-card-title>
	          <div>
	            <span class="grey--text" v-if="account.wallet.name">{{ account.wallet.name }}</span><br>
							<span v-if="account.wallet.address.address">
								<address-render :address="account.wallet.address.address" />
							</span>
							<v-list>
	              <v-list-tile v-if="mode === 'app'">
	                <v-list-tile-action>
	                  <v-switch v-model="local_node"></v-switch>
	                </v-list-tile-action>
	                <v-list-tile-title>Local Node</v-list-tile-title>
	              </v-list-tile>
	            </v-list>

	          </div>
	        </v-card-title>
	        <v-card-actions>
						<backup-wallet />
						<v-btn flat nuxt to="/dashboard">Dashboard</v-btn>
	          <v-spacer></v-spacer>
	          <v-btn flat v-if="mode === 'app'" @click="exit">Exit</v-btn>
	        </v-card-actions>
        </v-card>

      </v-menu>
		</v-toolbar>

		<!-- MAIN CONTENT AREA -->
		<v-content>
			<v-container>
				<no-ssr>
          <loading />
        </no-ssr>
        <v-snackbar
          v-model="showNotification"
          :timeout="timeout"
          :top="true"
          :vertical="true"
        >
          {{ notification_message }}
          <v-btn
            flat
            @click="showNotification = false"
          >
            Close
          </v-btn>
        </v-snackbar>
        <!-- NUXT BEGINNING -->
        <nuxt />
			</v-container>
		</v-content>

		<!-- FOOTER AREA -->
    <v-footer app
			height="auto"
			color="primary"
		>
	    &copy; {{ new Date().getFullYear() }} Aenco Solutions Ltd - Global Health Blockchain Financial Solutions
			<v-spacer></v-spacer>
			{{ version }}
	  </v-footer>
	</v-app>
</template>

<script>
import BackupWallet from '../components/BackupWallet'
import NetworkDiagnostics from '../components/NetworkDiagnostics'
import Loading from '../components/Loading'
import isElectron from 'is-electron'
// import childProcess from 'child_process'
if (isElectron()) {
	var execFile = require('child_process').execFile
	var remote = require('electron').remote
}

export default {
	components: {
		BackupWallet,
		Loading,
		NetworkDiagnostics
	},
	computed: {
		version () { return this.$g('version') },
		appRunTime () { return this.$store.state.meta.mode },
		visibleLinks () {
			if (this.$store.state.meta.wallet_present === true) {
				return this.items
			}
			var map = this.items.filter(a => {
				if(!a.hasOwnProperty('requireLogged')) { return a }
			})
			return map
		},
		account () { return this.$account.$store.state },
		currentPing () { return this.$store.state.internal.api_ping },
		currentApi () { return this.$store.state.internal.api_endpoint },
		environment () { return this.$store.state.meta.environment },
		mode: {
			get: function () { return this.$store.state.meta.mode },
			set: function (newVal) { }
		},
		// Functionality enabled / disabled
		local_node: {
			get: function () { return this.$store.state.settings.local_node },
			set: function (value) { this.$store.commit('setDeviceSetting', { 'key': 'local_node', 'value': value }) }
		},
		// notification details
		showNotification: {
			get: function () { return this.$store.state.notification.show },
			set: function (status) { this.$store.commit('setNotificationStatus', status) }
		},
		timeout () { return this.$store.state.notification.timeout },
		notification_type () { return this.$store.state.notification.type },
		notification_message () { return this.$store.state.notification.message }
	},
	methods: {
		exit () {
			console.debug('F:E:Exit')

			// Check if the user doesn't want to be remembered and reset the state machine
			if (this.$store.state.meta.remember_user === false) {
				this.$store.commit('reset')
				console.debug('E:Resetting state machine')
			}
			console.debug('E:Closing window')
			var window = remote.getCurrentWindow()
			window.close()
		}
	},
	watch: {
		hydrated: function () {
			console.debug('W:H:Hydrated')
			// Ping network until address is considered reachable
			if (this.$store.state.account.publicly_accessible === true) {
				this.$account.taskRunners()
				this.$account.startListeners()
			} else {
				var addressInterval = setInterval(function () {
					var result = this.$account.isWalletPublic(this.$store.state.account.address)
					if (result !== false) {
						console.debug('H:Address (' + this.$store.state.account.address + ') is on the network')
						this.$store.commit('setAccountProperty', { 'key': 'publicly_acessible', 'value': true })
						this.$account.taskRunners()
						this.$account.startListeners()
						clearInterval(addressInterval)
					}
				}.bind(this), 5000)
			}
		}
	},
	mounted () {
		console.debug('P:Root Page Created')

		this.$store.commit('setAppMode', 'web')

		var env = process.env.NODE_ENV || 'dev'
		this.$store.commit('setEnvironment', env)

		this.$store.commit('setLoading', { 't': 'global', 'v': true, 'm': 'Page Startup' })
		// Desktop app setup
		if (isElectron()) {
			this.$store.commit('setAppMode', 'app')
			// Electron specific code
			console.log('P:Running from within Electron, checking if system services installed for running Chain Node')
			const child = execFile('docker', ['-v'], (error, stdout, stderr) => {
				if (error) {
					console.error('stderr', stderr)
					throw error
				}
				if (stdout.startsWith('Docker version')) {
					console.log('P:Docker can be controlled by Electron')
					this.$store.commit('setElectronProperty', { 'docker_present': true })
				}
			})
			console.log(child)
		}

		this.$store.dispatch('rank_api_nodes')

		// Use a little timeout to give node ranking best chance to ping network first time
		setTimeout(function () {
			this.$account.updateApiEndpoint(this.$store.state.internal.api_endpoint)

			// Hydrate local state
			if (
				this.$store.state.account.private_key
				&& this.$store.state.account.wallet_private_key) {
				console.debug('R:State reports account present')
				this.$account.hydrate(
					this.$store.state.account.name,
					this.$store.state.account.password,
					this.$store.state.account.private_key,
					this.$store.state.account.network.byte
				)

				// Perform regular checks on wallet until declared as public
				var publicWalletInterval = setInterval(function() {
					this.$account.isWalletPublic(this.$account.$store.state.wallet.address.address)
					if(this.$account.$store.state.public === true) {
						clearInterval(publicWalletInterval)
					}
				}.bind(this), 5000)

			} else {
				if ($nuxt.$route.name !== 'index') {
					console.log('R:Sending the user back to home because account not present')
					this.$nuxt.$router.replace({ path: '/' })
				}
			}

			// API Node ping test / ranking
			setInterval(function () {
				this.$store.dispatch('rank_api_nodes')
				this.$account.updateApiEndpoint(this.$store.state.internal.api_endpoint)
			}.bind(this), 60000)

			// Generic network information that can be had without an account
			this.$store.dispatch('update_network_information')
			setInterval(function () {
				this.$store.dispatch('update_network_information')
			}.bind(this), 20000)

			this.$store.commit('setLoading', { 't': 'global', 'v': false })

			// Breathing space for API node ranking
		}.bind(this), 2000)
	},
	data () {
		return {
			drawer: false,
			hydrated: false,
			items: [
				{ icon: 'settings_system_daydream', title: 'Wallet Creation', to: '/' },
				{ icon: 'apps', title: 'Dashboard', to: '/dashboard', requireLogged: true },
				{ icon: 'account_balance_wallet', title: 'Ledger', to: '/ledger', requireLogged: true },
				{ icon: 'contacts', title: 'Address Book', to: '/address-book', requireLogged: true }
				// { icon: 'extension', title: 'Create Namespace', to: '/tokens', requireLogged: true }
			],
			title: 'AENChain Wallet',
			menu: false,
		}
	}
}
</script>
