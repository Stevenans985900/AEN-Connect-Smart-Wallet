<template>
  <v-container>
    <v-layout row justify-center align-center>
      <v-flex xs12>
        <v-card class="mb-4">
          <v-card-text>
            <v-layout row align-center>
              <v-flex xs12 md6>
                <!-- Initial setup -->
                <h1>
                  Welcome!
                </h1>
                <p>
                  This Smart wallet allows you to generate and manage multiple accounts on the
                  <a
                    href="https://aencoin.com/"
                    target="_blank"
                  >
                    AENChain network
                  </a>, Ethereum Network, Smart Contracts, and Bitcoin networks.
                </p>
                <p>
                  Before proceeding, you need to have an AEN wallet setup on this device, Please following the instructions
                  below to get started. If you need help at any point, you can click the question icon in the top right of
                  your screen to get both contextual and general help.
                </p>
              </v-flex>
              <v-flex md6>
                <v-img src="/logo-800.png" contain />
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <v-layout row justify-center align-center>
      <v-flex xs12>
        <v-card>
          <v-card-text>
            <v-layout>
              <v-flex xs12>
                <v-expansion-panel
                  v-model="panel"
                  expand
                >
                  <!-- Initial wallet creation screen -->
                  <v-expansion-panel-content>
                    <div slot="header">
                      <h2>
                        Wallet Creation
                      </h2>
                    </div>
                    <wallet-add v-if="!wallet" type="aen" :main="true" @complete="walletCreated" />
                  </v-expansion-panel-content>

                  <!-- Security configuration -->
                  <v-expansion-panel-content>
                    <div slot="header">
                      <h2>
                        Choose Security features to use
                      </h2>
                    </div>
                    <security-controls />
                    <v-btn @click="panel = [false,false,true]">
                      Continue
                    </v-btn>
                  </v-expansion-panel-content>

                  <!-- License agreement -->
                  <v-expansion-panel-content>
                    <div slot="header">
                      <h2>
                        Accept End User License Agreement
                      </h2>
                    </div>
                    <p v-if="testnet">
                      This wallet is on a testing network which means, you can receive some free coins to get started by visiting our faucet.
                      Click the button below to visit the Faucet.
                    </p>
                    <p>
                      Click the accept button to agree to the <a href="http://aencoin.com/eula">
                        End User License Agreement
                      </a>
                      and go to your wallet management screen.
                    </p>
                    <v-btn v-if="testnet" @click="goToFaucet">
                      Go to Faucet
                    </v-btn>
                    <v-btn color="primary" @click="acceptAndProceed">
                      Accept EULA and proceed
                    </v-btn>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import SecurityControls from '~/components/SecurityControls'
import WalletAdd from '~/components/WalletAdd'

function initialDataState() {
  return {
    panel: [true, false, false],
    dialogEulaAgree: false,
    wallet: null,
    seasons: [
      'Winter',
      'Spring',
      'Summer',
      'Fall'
    ]
  }
}
export default {
  /**
   * COMPONENTS
   */
  components: {
    SecurityControls,
    WalletAdd
  },
  /**
   * DATA
   */
  data() { return initialDataState() },
  head() {
    return {
      title: 'AENConnect Smart Wallet - Welcomes you',
      meta: [
        { hid: 'description', name: 'description', content: 'The start of your blockchain journey with AEN, supporting existing networks' }
      ]
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
          if (this.$store.getters["wallet/haveWalletType"]('aen') === true) {
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
    season (val) {
      return this.seasons[val]
    },
    /**
     * Method to send user on to dashboard once wallet has been created
     */
    walletCreated: function (wallet) {
      this.wallet = wallet
      this.panel = [false,true,false]
    },
    setupComplete: function () {
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
