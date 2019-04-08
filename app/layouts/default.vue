<template>
  <v-app dark>
    <!-- TOP BAR -->
    <v-toolbar fixed app>
      <v-toolbar-side-icon v-if="showNav" @click="toggleNav" />
      <v-btn flat to="/" active-class="">
        <v-img src="/logo.png" contain height="25" max-width="125px" />
      </v-btn>
    </v-toolbar>

    <!-- MAIN CONTENT AREA -->
    <v-content>
      <v-snackbar v-model="showNotification" :timeout="timeout" :top="true" :vertical="true" color="primary">
        {{ notification_message }}
        <v-btn flat @click="showNotification = false">
          Close
        </v-btn>
      </v-snackbar>
      <nuxt />
    </v-content>

    <!-- FOOTER AREA -->
    <v-footer app height="auto" color="primary">
      <v-toolbar dense>
        <v-toolbar-title>
          &copy; {{ new Date().getFullYear() }} Aarons footer
        </v-toolbar-title>
      </v-toolbar>
    </v-footer>
  </v-app>
</template>

<script>
import isElectron from 'is-electron'
import isOnline from 'is-online'
if (isElectron()) {
  // TODO Satisfy linter
  // const execFile = require('child_process').execFile
  // const remote = require('electron').remote
}

export default {
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
      pendingTransactionsClicked: false,
      userMenu: false
    }
  },
  /**
   * COMPUTED
   */
  computed: {
    isOnline() { return this.$store.state.runtime.isOnline },
    appMode() { return this.$store.state.runtime.mode },
    environment() { return this.$store.state.runtime.environment },
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
  async beforeMount() {
    // Ensure some global variables are clean for start
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
    this.$store.commit('BUSY', false)

    this.onlineCheck()
    setInterval(
      function () {
        this.onlineCheck()
      }.bind(this),
      this.$store.state.time_definitions.online_interval
    )
    this.$store.commit('setLoading', { t: 'global', v: false })

  },
  methods: {

    /**
     * Shutdown procedure
     */
    async onlineCheck() {
      const result = await isOnline()
      if(this.$store.state.runtime.isOnline !== result) {
        this.$store.commit('setRuntimeProperty', {
          key: 'isOnline',
          value: result
        })
      }
    },
    toggleNav() {
      if(this.$vuetify.breakpoint.mdAndUp === true) {
        this.minifyDrawer = !this.minifyDrawer
      } else {
        this.drawerOpen = !this.drawerOpen
      }

    },
    exit() {
      console.debug('F:E:Exit')

      // Check if the user doesn't want to be remembered and reset the state machine
      if (this.$store.state.meta.rememberUser === false) {
        this.$store.commit('reset')
        console.debug('E:Resetting state machine')
      }
    }
  }
}
</script>
