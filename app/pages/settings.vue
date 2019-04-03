<template>
  <v-container>
    <v-layout row wrap justify-center class="full-height">
      <!-- Security Options -->
      <v-flex xs12 class="mb-4">
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
      <v-flex xs12 md6>
        <v-card>
          <v-toolbar class="primary mb-2">
            <v-toolbar-title>
              {{ $t('settings.label.update_frequency') }}
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <p>{{ $t('settings.message.update_frequency') }}</p>
            <time-interval-options />
          </v-card-text>
        </v-card>
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
    // Only start once global loading finished
    const preparationInterval = setInterval(
      function () {
        if (this.$store.getters.booting === false) {
          clearInterval(preparationInterval)
          this.$store.commit('setLoading', { t: 'router', v: false })
        }
      }.bind(this),
      this.$store.state.time_definitions.controller_poll
    )
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
