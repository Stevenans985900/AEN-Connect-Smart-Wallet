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
          v-for="(item, i) in items"
          exact
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
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

      <!-- Quick balance display -->
      <template v-if="account.meta.balance != 0" >
        <v-btn>
          Balance: {{ account.meta.balance }}
        </v-btn>
      </template>

			<!-- USER DROPDOWN -->
      <v-menu
        v-if="account.account"
        v-model="menu"
        :close-on-content-click="false"
      >
			<v-avatar slot="activator" size="24">
					<img
						src="https://cdn.vuetifyjs.com/images/john.jpg"
						alt="John"
					>
				</v-avatar>

				<v-card>
          <v-card-title>
	          <div>
	            <span class="grey--text" v-if="account.wallet.name">{{ account.wallet.name }}</span><br>
	            <span v-if="account.account.address">{{ account.account.address.address }}</span>
	            <v-list>
	              <v-list-tile v-if="mode === 'app'">
	                <v-list-tile-action>
	                  <v-switch v-model="local_node"></v-switch>
	                </v-list-tile-action>
	                <v-list-tile-title>Local Node</v-list-tile-title>
	              </v-list-tile>
	            </v-list>
	            <network-diagnostics></network-diagnostics>
	          </div>
	        </v-card-title>
	        <v-card-actions>
	          <v-btn flat nuxt to="/dashboard">Dashboard</v-btn>
	          <v-spacer></v-spacer>
	          <v-btn flat v-if="mode === 'app'">Exit</v-btn>
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
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
	</v-app>
</template>

<script>
import NetworkDiagnostics from '../components/NetworkDiagnostics'
import Loading from '../components/Loading'
// import childProcess from 'child_process'
const execFile = require('child_process').execFile

export default {
	components: {
		Loading,
		NetworkDiagnostics
	},
	computed: {
		account () { return this.$account.$store.state },
		currentPing () { return this.$store.state.internal.api_ping },
		currentApi () { return this.$store.state.internal.api_endpoint },
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
		this.$store.commit('setLoading', { 't': 'global', 'v': true, 'm': 'Page Startup' })
		// Desktop app setup
		if (process.versions.hasOwnProperty('electron')) {
			this.$store.commit('setAppMode', 'app')
			// Electron specific code
			console.log('P:Running from within Electron, checking if system services installed for running Chain Node')
			const child = execFile('docker', ['-v'], (error, stdout, stderr) => {
				if (error) {
					console.error('stderr', stderr)
					throw error
				}
				if (stdout.startsWith('Docker version')) {
					console.log('Docker Found')
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
			if (this.$store.state.meta.account_present === true) {
				console.debug('R:State reports account present')
				this.hydrated = this.$account.hydrate(
					this.$store.state.account.name,
					this.$store.state.account.password,
					this.$store.state.account.private_key,
					this.$store.state.account.network.identifier,
					this.$store.state.account.network.byte,
					this.$store.state.account.private_key
				)
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
				{ icon: 'apps', title: 'Dashboard', to: '/dashboard' },
				{ icon: 'account_balance_wallet', title: 'Ledger', to: '/ledger' },
				{ icon: 'contacts', title: 'Address Book', to: '/address-book' }
			],
			title: 'AENChain Wallet',
			menu: false,
		}
	}
}
</script>
