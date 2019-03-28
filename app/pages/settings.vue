<template>
  <v-container>
    <v-layout row wrap justify-center align-center>
      <!-- Security Options -->
      <v-flex xs12 class="mb-2">
        <v-toolbar class="primary">
          <v-toolbar-title>
            Security Controls
          </v-toolbar-title>
        </v-toolbar>
        <v-card>
          <v-card-text>
            <security-controls />
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 class="mb-2">
        <v-toolbar class="primary">
          <v-toolbar-title>
            {{ $t('settings.label.denominations') }}
          </v-toolbar-title>
        </v-toolbar>
        <v-card>
          <v-card-text>
            <p>{{ $t('settings.message.denominations') }}</p>
            <token-display-options />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import SecurityControls from '~/components/SecurityControls'
  import TokenDisplayOptions from '~/components/TokenDisplayOptions'

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
      this.$g('internal.controllerPollReadyInterval')
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
