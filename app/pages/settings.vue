<template>
  <v-container>
    <v-layout row wrap justify-center class="full-height mb-4">
      <!-- Security Options -->
      <v-flex xs12 md6 class="pr-2">
        <v-card>
          <v-toolbar class="primary mb-2">
            <v-toolbar-title>
              Security Controls
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <security-controls />
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 md6 pr-2>
        <v-card>
          <v-toolbar class="primary mb-2">
            <v-toolbar-title>
              {{ $t('settings.label.denominations') }}
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p>{{ $t('settings.message.denominations') }}</p>
            <token-display-options />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <v-layout row wrap>
      <v-flex xs12>
        <v-expansion-panel>
          <v-expansion-panel-content>
            <template v-slot:header>
              <div>
                {{ $t('settings.label.update_frequency') }}
              </div>
            </template>
            <v-card>
              <v-card-text>
                <time-interval-options />
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
          <v-expansion-panel-content>
            <template v-slot:header>
              <div>
                {{ $t('settings.label.per_wallet_security') }}
              </div>
            </template>
            <v-card>
              <v-card-text>
                <security-controls :global-security-only="false" />
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style scoped>
  .full-height .flex {
    display: flex;
  }

  .full-height .flex > .v-card {
    flex: 1 1 auto;
  }
</style>
<script>
  import SecurityControls from '~/components/SecurityControls'
  import TokenDisplayOptions from '~/components/TokenDisplayOptions'
  import TimeIntervalOptions from '~/components/TimeIntervalOptions'

  function initialDataState() {
    return {
      interval: null,
      existingPassword: false,
      password1: '',
      password2: '',
      showPassword: false,
      rules: {
        basic: {
          required: value => !!value || 'Required.'
        },
        password: {
          minLength: v => v.length >= 8 || 'Min 8 characters'
        }
      }
    }
  }
export default {
  components: {
    SecurityControls,
    TimeIntervalOptions,
    TokenDisplayOptions
  },
  /**
   * DATA
   * @returns {{dialog: boolean, headers: *[], search: string}}
   */
  data() { return initialDataState() },
  head() {
    return {
      title: 'AENConnect Smart Wallet - Security Controls',
      meta: [
        { hid: 'description', name: 'description', content: 'Define what level of security you will use with the program and various wallets' }
      ]
    }
  },
  computed: {
    aenWallets() {
      return Object.values(this.$store.getters['wallet/walletsByType']('aen'))
    },
    mainAenWallet: {
      get: function () { return this.$store.state.wallet.aen.mainAddress },
      set: function (val) {
        this.$store.commit('wallet/setAenProperty', {
          key: 'mainAddress',
          value: val
        })
      }
    }
  },
  /**
   * MOUNTED
   */
  mounted: function () {
    this.$log.debug('Dashboard Startup')
    // Only start once global loading finished
    this.interval = setInterval(
      function () {
        if (this.$store.getters.booting === false) {
          clearInterval(this.interval)
          this.$store.commit('setLoading', { t: 'router', v: false })
        }
      }.bind(this),
      this.$store.state.time_definitions.controller_poll
    )
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    /**
     * Facade handler for picking up password reset request
     */
    changePassword() {
      // TODO Working from here
      // Check that the two passwords match just in case validation failed
      // Update the state variable for the password change
    },
    passwordsMatch() {
      return (this.password1 === this.password2) ? '' : 'Passwords must match'
    }
  }
}
</script>
