<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <!-- Initial setup -->
      <v-card>
        <v-card-title class="headline">Welcome to AEN Smart Wallet ({{ network }})</v-card-title>
        <v-card-text>
          <p>
            This Smart wallet allows you to generate and manage accounts on the
            <a
              href="https://aencoin.com/"
              target="_blank"
            >AENChain network</a>
          </p>
          <p>Before proceeding, you need to have an AEN wallet setup on this device. Please choose one of the options below</p>
          <wallet-add type="aen" @complete="complete()"/>
        </v-card-text>
      </v-card>
    </v-flex>

    <!-- New Wallet Dialog -->
    <v-dialog v-model="dialogFaucetInstructions" persistent max-width="600px">
      <v-card>
        <v-card-title class="headline">Get free coins?</v-card-title>
        <v-card-text>Being on the testnet, you can receive some free coins to get started by visiting our faucet. Would you like to do that now?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn flat="flat" @click="faucetDecline">No</v-btn>
          <v-btn flat="flat" @click="faucetAccept">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import WalletAdd from "~/components/WalletAdd";

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
      dialogFaucetInstructions: false
    }
  },
  /**
   * COMPUTED
   */
  computed: {
    network() {
      return this.$store.state.wallet.aen.network.name
    }
  },
  /**
   * MOUNTED
   */
  mounted: function() {
    console.debug("Index Page: Started")
    // Only start once global loading finished
    let preparationInterval = setInterval(
      function() {
        if (this.$store.getters.booting === false) {
          // Redirect user to the dashboard if they already have account
          if (this.$store.state.wallet.aen.haveWallet === true) {
            console.debug("User has saved wallet present, redirecting to dashboard")
            this.$nuxt.$router.replace({ path: "/dashboard" })
          }
          clearInterval(preparationInterval)
          this.$store.commit("setLoading", { t: "router", v: false })
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
    complete: function(wallet) {
      // If the wallet is on the testnet, show user a dialog to go to faucet to get some test coins otherwise, go to
      // wallet management
      if(wallet.network.hasOwnProperty('testing')) {
        this.showFaucetiDialog = true
      } else {
        this.$nuxt.$router.replace({ path: "/wallet" })
      }
    },
    faucetAccept: function() {
      window.open(this.$g('aen.faucets')[0].address)
    },
    faucetDecline: function() {
      this.$nuxt.$router.replace({ path: "/wallet" })
    }
  }
};
</script>
