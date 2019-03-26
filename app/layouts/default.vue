<template>
  <v-app dark>
    <!-- NAV DRAWER -->
    <v-navigation-drawer v-model="cDrawerOpen" :mini-variant="minifyDrawer" v-if="showNav" stateless app>
      <v-layout column fill-height>
        <v-list>
          <v-list-tile v-for="(item, i) in navigationItems" :key="i" :to="item.to" router exact>
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              {{ $t('common.navigation.'+item.key) }}
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-spacer />
        <v-list>
          <v-list-tile to="/settings">
            <v-list-tile-action>
              <v-icon>settings</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              {{ $t('common.navigation.settings') }}
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-layout>
    </v-navigation-drawer>

    <!-- TOP BAR -->
    <v-toolbar fixed app>
      <v-toolbar-side-icon @click="toggleNav" v-if="showNav" />
      <v-btn flat to="/">
        <v-img src="/logo.png" contain height="25" max-width="125px" />
      </v-btn>
      <v-toolbar-title class="hidden-sm-and-down text-xs-left" v-text="title" />
      <v-spacer />
      <!-- Environment -->
      <no-ssr>
        <busy />
      </no-ssr>
      <development v-if="environment === 'development'" />
      <help />
    </v-toolbar>

    <!-- MAIN CONTENT AREA -->
    <v-content>
      <v-container fluid>
        <security-challenge />
        <v-snackbar v-model="showNotification" :timeout="timeout" :top="true" :vertical="true">
          {{ notification_message }}
          <v-btn flat @click="showNotification = false">
            Close
          </v-btn>
        </v-snackbar>
        <nuxt />
      </v-container>
    </v-content>

    <!-- Exit Dialog -->
    <!--<v-dialog v-if="dialogExit === true" v-model="dialogExit" persistent max-width="450px">-->
    <!--<v-toolbar color="primary">-->
    <!--<v-toolbar-title>{{ $t('common.message.are_you_sure') }}</v-toolbar-title>-->
    <!--<v-spacer />-->
    <!--<v-btn small icon outline @click="dialogExit = false">-->
    <!--<v-icon>close</v-icon>-->
    <!--</v-btn>-->
    <!--</v-toolbar>-->
    <!--<p>-->
    <!---->
    <!--</p>-->
    <!--<make-transfer :wallet="contextWallet" @complete="transferComplete()" />-->
    <!--</v-dialog>-->

    <!-- FOOTER AREA -->
    <v-footer app height="auto" color="primary">
      <v-toolbar dense>
        <v-toolbar-title>
          &copy; {{ new Date().getFullYear() }} {{ $t('common.message.footer_text') }}
        </v-toolbar-title>
        <v-spacer />
        {{ version }}#{{ buildNumber }}
      </v-toolbar>
    </v-footer>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'
import Busy from '~/components/Busy'
import Development from '~/components/Development'
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
    SecurityChallenge
  },
  /**
   * DATA
   */
  data() {
    return {
      dialogExit: false,
      minifyDrawer: false,
      drawerOpen: false,
      hydrated: false,
      navigationItems: [
        {
          icon: 'apps',
          key: 'dashboard',
          to: '/dashboard'
        },
        {
          icon: 'settings_system_daydream',
          key: 'wallet_management',
          to: '/wallet'
        },
        {
          icon: 'settings_ethernet',
          key: 'exchange',
          to: '/exchange'
        },
        {
          icon: 'settings_remote',
          key: 'aen',
          to: '/aen-blockchain'
        },
        {
          icon: 'contacts',
          key: 'address_book',
          to: '/address-book'
        }
      ],
      title: 'Smart Connect',
      userMenu: false
    }
  },
  /**
   * COMPUTED
   */
  computed: {
    cDrawerOpen: {
      get: function() {
        if (this.$vuetify.breakpoint.mdAndUp === true) {
          return true
        } else {
          return this.drawerOpen
        }
      },
      set: function (val) { this.drawerOpen = val }
    },
    dialogHelp: {
      get: function () { return this.$store.state.user.help },
      set: function (val) { this.$store.commit('setUserProperty', {key: 'help', value: val}) }
    },
    eulaAgreed() { return this.$store.state.user.eulaAgree },
    isOnline() { return this.$store.state.runtime.isOnline },
    buildNumber() { return this.$g('build_number') },
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
    showNav() { return this.$store.state.user.eulaAgree },
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
    // Ensure some global variables are clean for start
    this.$store.commit('CACHE_SKIP', false)
    this.$store.commit('setAppMode', 'web')
    const env = process.env.NODE_ENV || 'dev'
    this.$store.commit('setRuntimeProperty', { key: 'environment', value: env })

    // Determine how to handle main navigation by default depending on device size
    if(this.$vuetify.breakpoint.mdAndUp === true) {
      this.drawerOpen = true
      this.minifyDrawer = true
    } else {
      this.minifyDrawer = false
      this.drawerOpen = false
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
      this.$store.commit('wallet/setAenProperty', { key: 'activeApiEndpoint', value: this.$g('aen.api_endpoints')[0].address })
      this.$store.commit('wallet/setBtcProperty', { key: 'activeApiEndpoint', value: this.$g('btc.api_endpoints')[0].address })
      this.$store.commit('wallet/setEthProperty', { key: 'activeApiEndpoint', value: this.$g('eth.api_endpoints')[0].address })

      if (Object.keys(this.$store.state.wallet.aen.network).length === 0) {
          this.$store.commit('wallet/setAenProperty', { key: 'network', value: this.$g('aen.available_networks')[0] })
      }
      if (Object.keys(this.$store.state.wallet.btc.network).length === 0) {
          this.$store.commit('wallet/setBtcProperty', { key: 'network', value: this.$g('btc.available_networks')[0] })

      }
      if (Object.keys(this.$store.state.wallet.eth.network).length === 0) {
        this.$store.commit('wallet/setEthProperty', { key: 'network', value: this.$g('eth.available_networks')[0] })
      }

    this.rankApiNodes()
    setInterval(
      function () {
          this.rankApiNodes()
      }.bind(this),
      this.$g('internal.apiEndpointPingInterval')
    )

    // Perform an initial investigation in to state of each network
    //   this.$store.dispatch('wallet/queryApiNode', 'aen')
    //   this.$store.dispatch('wallet/queryApiNode', 'btc')
    //   this.$store.dispatch('wallet/queryApiNode', 'eth')

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
      ...mapActions({
          rankApiNodes: 'wallet/rankApiNodes'
      }),
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
    toggleNav() {
      if(this.$vuetify.breakpoint.mdAndUp === true) {
        this.minifyDrawer = !this.minifyDrawer
      } else {
        this.drawerOpen = true
      }

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
