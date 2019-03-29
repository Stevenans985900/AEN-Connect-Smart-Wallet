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
                  {{ $t('index.label.welcome') }}
                </h1>
                <p v-html="$t('index.message.introduction')" />
                <p v-html="$t('index.message.instruction')" />
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
                  readonly
                  expand
                >
                  <!-- Initial wallet creation screen -->
                  <v-expansion-panel-content>
                    <div slot="header">
                      <h2>
                        {{ $t('index.label.wallet_creation') }}
                      </h2>
                    </div>
                    <wallet-add v-if="!wallet" type="aen" :main="true" @complete="walletCreated" />
                  </v-expansion-panel-content>

                  <!-- Security configuration -->
                  <v-expansion-panel-content>
                    <div slot="header">
                      <h2>
                        {{ $t('index.label.security_features') }}
                      </h2>
                    </div>
                    <p>
                      {{ $t('security.message.instructions') }}
                    </p>
                    <security-controls />
                    <v-btn class="primary" @click="panel = [false,false,true]">
                      {{ $t('common.action.continue') }}
                    </v-btn>
                  </v-expansion-panel-content>

                  <!-- License agreement -->
                  <v-expansion-panel-content>
                    <div slot="header">
                      <h2>
                        {{ $t('index.label.accept_end_user_license_agreement') }}
                      </h2>
                    </div>
                    <p class="pa-2" v-html="$t('eula.message.introduction')" />
                    <v-btn color="primary" @click="acceptAndProceed">
                      {{ $t('eula.action.agree_eula') }}
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
    this.$log.debug('Index Startup')
    // Only start once global loading finished
    const preparationInterval = setInterval(
      function () {
        if (this.$store.getters.booting === false) {
          // Redirect user to the dashboard if they already have account
          if (this.$store.getters["wallet/haveWalletType"]('aen') === true) {
            this.$log.debug('Redirecting user to the dashboard')
            this.$nuxt.$router.replace({ path: '/dashboard' })
          }
          clearInterval(preparationInterval)
          this.$store.commit('setLoading', { t: 'router', v: false })
        }
      }.bind(this),
      this.$store.state.time_definitions.controller_poll
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
