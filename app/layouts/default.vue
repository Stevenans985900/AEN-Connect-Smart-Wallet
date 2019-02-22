<template>
  <v-app dark>
    <!-- NAV DRAWER -->
    <v-navigation-drawer v-model="showMainNav" :mini-variant="minifyDrawer" fixed stateless app>
      <v-list>
        <v-list-tile v-for="(item, i) in navigationItems" :key="i" :to="item.to" router exact>
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title" />
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="appMode === 'app'" exact @click="exit">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Exit
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <!-- TOP BAR -->
    <v-toolbar fixed app>
      <v-toolbar-side-icon v-if="showMainNav" @click="minifyDrawer = !minifyDrawer" />
      <!--size="24"-->
      <!--<v-avatar >-->
      <v-btn flat active-class="" to="/dashboard" :disabled="!showMainNav">
        <v-img src="/logo.png" contain height="25" max-width="125px" />
      </v-btn>
      <!--</v-avatar>-->
      <v-toolbar-title class="hidden-sm-and-down text-xs-left" v-text="title" />
      <v-spacer />
      <!-- Environment -->
      <no-ssr>
        <busy />
      </no-ssr>
      <development v-if="environment === 'development'" />
      <network-diagnostics />
      <help />
    </v-toolbar>

    <!-- MAIN CONTENT AREA -->
    <v-content>
      <v-container fluid>
        <no-ssr>
          <loading />
        </no-ssr>
        <security-challenge />
        <v-snackbar v-model="showNotification" :timeout="timeout" :top="true" :vertical="true">
          {{ notification_message }}
          <v-btn flat @click="showNotification = false">
            Close
          </v-btn>
        </v-snackbar>
        <!-- NUXT BEGINNING -->
        <nuxt />

        <v-dialog v-model="developmentAgreed" persistent max-width="500px">
          <v-layout align-center justify-center>
            <v-flex xs12>
              <v-card width="500px">
                <youtube video-id="kfWu3fKLe2I" player-width="500" />
                <v-alert
                  :value="true"
                  type="warning"
                >
                  This is the first community release, please do not use this wallet to store real accounts on!
                </v-alert>
                <v-card-actions>
                  <v-btn block @click="developmentAgreed = true">
                    Click here to continue
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-layout>
        </v-dialog>

        <!-- Force the user to agree to the End User license agreement before being able to use the wallet -->
        <v-dialog v-model="dialogEulaAgree" persistent max-width="600px">
          <v-card>
            <v-checkbox v-model="eulaAgree">
              <span slot="label">
                I agree to the
                <a href="http://aencoin.com/eula">
                  AEN EULA
                </a>
              </span>
            </v-checkbox>
          </v-card>
        </v-dialog>
      </v-container>
    </v-content>

    <!-- FOOTER AREA -->
    <v-footer app height="auto" color="primary">
      <v-toolbar dense>
        <v-toolbar-title>&copy; {{ new Date().getFullYear() }} Aenco Solutions Ltd - Global Health Blockchain Financial Solutions</v-toolbar-title>
        <v-spacer />
        {{ version }}
      </v-toolbar>
    </v-footer>
  </v-app>
</template>

<script>

import Busy from '~/components/Busy'
import Development from '~/components/Development'
import NetworkDiagnostics from '~/components/NetworkDiagnostics'
import Loading from '~/components/Loading'
import Help from '~/components/Help'
import SecurityChallenge from '~/components/SecurityChallenge'
import isElectron from 'is-electron'
import isOnline from 'is-online'

// import childProcess from 'child_process'
if (isElectron()) {
  // TODO Satisfy linter
  // const execFile = require('child_process').execFile
  // const remote = require('electron').remote
}

export default {
  /**
   * COMPONENTS
   */
  components: {
    Busy,
    Development,
    Help,
    Loading,
    NetworkDiagnostics,
    SecurityChallenge
  },
  /**
   * DATA
   */
  data() {
    return {
      minifyDrawer: false,
      hydrated: false,
      navigationItems: [
        {
          icon: 'apps',
          title: 'Dashboard',
          to: '/dashboard'
        },
        {
          icon: 'settings_system_daydream',
          title: 'Wallet Management',
          to: '/wallet'
        },
        {
          icon: 'contacts',
          title: 'Address Book',
          to: '/address-book'
        },
        {
          icon: 'lock_open',
          title: 'Security',
          to: '/security'
        }
      ],
      title: 'Smart Wallet',
      userMenu: false
    }
  },
  /**
   * COMPUTED
   */
  computed: {
    dialogHelpShow: {
      get: function () { return this.$store.state.user.help },
      set: function (val) { this.$store.commit('setUserProperty', {key: 'help', value: val}) }
    },
    showMainNav: {
      get: function () {
        if (this.$store.state.wallet.aen.mainAddress !== '' && this.$store.state.user.eulaAgree === true) {
          return true
        }
        return false
      },
      set : function () {}
    },
    developmentAgreed: {
      get: function () { return !this.$store.state.user.developmentAgreed },
      set: function (val) {
        this.$store.commit('setUserProperty', {
          key: 'developmentAgreed',
          value: val
        })
      }
    },
    dialogEulaAgree() {
      if (this.$store.state.user.eulaAgree === false && this.$nuxt.$route.name !== 'index') {
        return true
      }
      return false
    },
    eulaAgree: {
      get: function () { return this.$store.state.user.eulaAgree },
      set: function (val) {
        this.$store.commit('setUserProperty', {
          key: 'eulaAgree',
          value: val
        })
      }
    },
    isOnline() { return this.$store.state.runtime.isOnline },
    version() { return this.$g('version') },
    appMode() { return this.$store.state.runtime.mode },
    environment() { return this.$store.state.runtime.environment },
    haveWallet() { return this.$store.state.wallet.aen.haveWallet },
    // Functionality enabled / disabled
    runningLocalNode: {
      get: function () { return this.$store.state.electron.runningLocalNode },
      set: function (value) {
        this.$store.commit('setElectronProperty', {
          key: 'runningLocalNode',
          value: value
        })
      }
    },
    // notification details
    showNotification: {
      get: function () {
        return this.$store.state.notification.show
      },
      set: function (status) {
        this.$store.commit('setNotificationStatus', status)
      }
    },
    timeout() {
      return this.$store.state.notification.timeout
    },
    notification_type() {
      return this.$store.state.notification.type
    },
    notification_message() {
      return this.$store.state.notification.message
    }
  },
  /**
   *
   */
  beforeMount() {
    this.$store.commit('security/resetAttemptCount')
    this.$store.commit('setAppMode', 'web')
    const env = process.env.NODE_ENV || 'dev'
    this.$store.commit('setRuntimeProperty', {
      key: 'environment',
      value: env
    })
    if(window.innerWidth < 1366) {
      this.minifyDrawer = true
    } else {
      this.minifyDrawer = false
    }
    this.$store.commit('setLoading', {
      t: 'global',
      v: true,
      m: 'Page Startup'
    })
    this.$store.commit('setLoading', {
      t: 'page',
      v: false
    })

    this.onlineCheck()
    setInterval(
      function () {
        this.onlineCheck()
      }.bind(this),
      this.$g('internal.commonTasksInterval')
    )

    // Desktop app setup
    // if (isElectron()) {
    //   this.$store.commit('setAppMode', 'app')
    //   // Electron specific code
    //   console.log('P:Running from within Electron, checking if system services installed for running Chain Node')
    //   const child = execFile('docker', ['-v'], (error, stdout, stderr) => {
    //     if (error) {
    //       console.error('stderr', stderr)
    //       throw error
    //     }
    //     if (stdout.startsWith('Docker version')) {
    //       console.log('P:Docker can be controlled by Electron')
    //       this.$store.commit('setElectronProperty', { docker_present: true })
    //     }
    //   })
    //   console.log(child)
    // }

    // Check network settings and create a set of defaults based from first available
    // TODO Abstract this defaulting to a component of it's own which can pickup a "wallets available" setting
      if (Object.keys(this.$store.state.wallet.aen.network).length === 0) {
          this.$store.commit('wallet/setAenProperty', { key: 'network', value: this.$g('aen.available_networks')[0] })
      }
      if (Object.keys(this.$store.state.wallet.btc.network).length === 0) {
          this.$store.commit('wallet/setBtcProperty', { key: 'network', value: this.$g('bitcoin.available_networks')[0] })
      }
    if (this.$store.state.wallet.eth.activeApiEndpoint === '') {
      this.$store.commit('wallet/setEthereumProperty', { key: 'network', value: this.$g('eth.available_networks')[0] })
      this.$store.commit('wallet/setEthereumProperty', { key: 'activeApiEndpoint', value: this.$g('eth.available_networks')[0].infura_api_endpoint })
    }

    this.$store.dispatch('wallet/rankApiNodes')
    setInterval(
      function () {
        this.$store.dispatch('wallet/rankApiNodes')
      }.bind(this),
      this.$g('internal.apiEndpointPingInterval')
    )

    this.$store.dispatch('updateGenericNetworkInformation')
    setInterval(
      function () {
        this.$store.dispatch('updateGenericNetworkInformation')
      }.bind(this),
      this.$g('internal.commonTasksInterval')
    )

    // TODO Update currency exchange rates from binance. Due to CORS restriction, investigate web account or use proxy
    // this.$store.dispatch('exchange/updateRates')

    this.$store.commit('setLoading', { t: 'global', v: false })
    if (this.$store.state.wallet.aen.mainAddress !== '') {

      this.$store.dispatch('security/addCheck', {
          challenge: 'app_start',
          address: this.$store.state.wallet.aen.mainAddress,
          blocking: true
        })
    } else {
      if (this.$nuxt.$route.name !== 'index') {
        this.$nuxt.$router.replace({ path: '/' })
      }
    }
  },
  methods: {
    /**
     * Shutdown procedure
     */
    async onlineCheck() {
      const result = await isOnline()
      this.$store.commit('setRuntimeProperty', {
        key: 'isOnline',
        value: result
      })
    },

    exit() {
      console.debug('F:E:Exit')

      // Check if the user doesn't want to be remembered and reset the state machine
      if (this.$store.state.meta.rememberUser === false) {
        this.$store.commit('reset')
        console.debug('E:Resetting state machine')
      }

      // If running the smart wallet as an app which has a window which can be closed
      // if (this.$store.state.meta.mode === 'app') {
      //   console.debug('E:Closing window')
      //   const window = remote.getCurrentWindow()
      //   window.close()
      // }
    }
  }
}
</script>
