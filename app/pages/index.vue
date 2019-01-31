<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <!-- Initial setup -->
      <v-card>
        <v-card-title class="headline">
          Welcome to AEN Smart Wallet ({{ network }})
        </v-card-title>
        <v-card-text>
          <p>
            This Smart wallet allows you to generate and manage accounts on the
            <a
              href="https://aencoin.com/"
              target="_blank"
            >
              AENChain network
            </a>
          </p>
          <p>Before proceeding, you need to have an AEN wallet setup on this device. Please choose one of the options below</p>
          <wallet-add v-if="!wallet" type="aen" @complete="complete" />
        </v-card-text>
      </v-card>
    </v-flex>

    <!-- New Wallet Dialog -->
    <v-dialog v-model="dialogEulaAgree" persistent max-width="600px">
      <v-toolbar color="primary">
        <v-toolbar-title>Accept End User License Agreement</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <p v-if="testnet">
            This wallet is on a testing network which means, you can receive some free coins to get started by visiting our faucet.
            Click the button below to visit the Faucet
          </p>
          <p>
            By proceeding, you agree to the AENChain <a href="http://aencoin.com/eula">
              End User License Agreement
            </a>.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn v-if="testnet" flat="flat" @click="goToFaucet">
            Go to Faucet
          </v-btn>
          <v-btn flat="flat" @click="acceptAndProceed">
            Accept EULA and proceed
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import WalletAdd from '~/components/WalletAdd'

export default {
  /**
   * COMPONENTS
   */
  components: {
    WalletAdd
  },
  /**
   * DATA
   */
  data() {
    return {
      dialogEulaAgree: false,
      wallet: null
    }
  },
  /**
   * COMPUTED
   */
  computed: {
    network() {
      return this.$store.state.wallet.aen.network.name
    },
    testnet() {
      try {
        return this.wallet.network.testing
      } catch (e) {
        return false
      }
    }
  },
  /**
   * MOUNTED
   */
  mounted: function () {
    console.debug('Index Page: Started')
    // Only start once global loading finished
    const preparationInterval = setInterval(
      function () {
        if (this.$store.getters.booting === false) {
          // Redirect user to the dashboard if they already have account
          if (this.$store.state.wallet.aen.haveWallet === true) {
            console.debug('User has saved wallet present, redirecting to dashboard')
            this.$nuxt.$router.replace({ path: '/dashboard' })
          }
          clearInterval(preparationInterval)
          this.$store.commit('setLoading', { t: 'router', v: false })
        }
      }.bind(this),
      this.$g('internal.controllerPollReadyInterval')
    )
  },
  /**
   * METHODS
   */
  methods: {
    /**
     * Method to send user on to dashboard once wallet has been created
     */
    complete: function (wallet) {
      this.wallet = wallet
      this.dialogEulaAgree = true
    },
    goToFaucet: function () {
      window.open(this.$g('aen.faucets')[0].address + '?address=' + this.wallet.address)
    },
    acceptAndProceed: function () {
      this.$store.commit('setUserProperty', { key: 'eulaAgree', value: true })
      this.$nuxt.$router.replace({ path: '/wallet' })
    }
  }
}
</script>
