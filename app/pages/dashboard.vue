<template>
  <v-container>
    <!-- WALLETS -->
    <v-layout row wrap align-center mb-4>
      <v-flex xs12>
        <v-toolbar class="primary mb-2">
          <v-toolbar-title>{{ $t('common.label.wallets') }}</v-toolbar-title>
          <v-spacer />
          <v-menu offset-y :disabled="!agreedToEula">
            <v-btn slot="activator" color="success" :disabled="!agreedToEula">
              <v-icon>add</v-icon>{{ $t('wallet.action.add') }}
            </v-btn>
            <v-list>
              <v-list-tile @click="walletType = 'aen'; dialogWalletAdd = true">
                <v-list-tile-title>{{ $t('network.label.aen') }}</v-list-tile-title>
              </v-list-tile>
              <v-list-tile @click="walletType = 'eth'; dialogWalletAdd = true">
                <v-list-tile-title>{{ $t('network.label.eth') }}</v-list-tile-title>
              </v-list-tile>
              <v-list-tile @click="walletType = 'btc'; dialogWalletAdd = true">
                <v-list-tile-title>{{ $t('network.label.btc') }}</v-list-tile-title>
              </v-list-tile>
              <v-list-tile v-if="haveEthereumWallet === true" @click="walletType = 'contract'; dialogWalletAdd = true">
                <v-list-tile-title>{{ $t('network.label.contract') }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-toolbar>
        <v-card flat>
          <graph-balance-spread :render-watch="renderWatch" />
        </v-card>
      </v-flex>
      <!-- New Wallet Dialog -->
      <v-dialog v-if="dialogWalletAdd" v-model="dialogWalletAdd" persistent max-width="1024px">
        <v-toolbar color="primary">
          <v-toolbar-title>{{ $t('wallet.action.add') }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="dialogWalletAdd = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card>
          <v-card-text>
            <wallet-add :type="walletType" @complete="walletAdded()" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>

    <!-- ICOs -->
    <v-layout row wrap>
      <v-flex xs12>
        <v-toolbar class="primary mb-2">
          <v-toolbar-title>{{ $t('common.label.opportunities') }}</v-toolbar-title>
        </v-toolbar>
        <v-card v-for="(opportunity, index) in opportunities" :key="index" class="mb-2">
          <v-card-title v-if="opportunity.status == 'ended'" class="ribbon ribbon-top-right">
            <span>{{ $t('opportunity.label.status_' + opportunity.status) }}</span>
          </v-card-title>
          <v-card-text class="pb-0">
            <v-layout row align-center>
              <v-flex xs3 md2>
                {{ opportunity.name }}
              </v-flex>
              <v-flex xs3 md6 pr-2>
                <v-slider
                  :value="toMillion(opportunity.raised)"
                  :max="toMillion(opportunity.requested)"
                  step="0.1"
                  thumb-label="always"
                  readonly
                />
              </v-flex>
              <v-flex xs6 md4 class="text-xs-center">
                <v-btn v-if="opportunity.status === 'active'" small outline block>
                  {{ $t('common.label.information') }}
                </v-btn>
                <p>
                  USD {{ toMillion(opportunity.raised) }}M / {{ toMillion(opportunity.requested) }}M
                  <span v-if="$vuetify.breakpoint.mdAndUp">
                    {{ $t('opportunity.label.raised') }}
                  </span>
                </p>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style scoped>
  /* common */
  .ribbon {
    width: 10rem;
    height: 6rem;
    overflow: hidden;
    position: absolute;
  }
  .ribbon::before,
  .ribbon::after {
    position: absolute;
    z-index: -1;
    content: '';
    display: block;
  }
  .ribbon span {
    position: absolute;
    display: block;
    width: 17rem;
    padding: 1rem 0;
    background-color: #00bcca;
    color: #fff;
    text-transform: uppercase;
    text-align: center;
  }
  /* top right*/
  .ribbon-top-right {
    top: 0;
    right: 0;
  }
  .ribbon-top-right::before,
  .ribbon-top-right::after {
    border-top-color: transparent;
    border-right-color: transparent;
  }
  .ribbon-top-right::before {
    top: 0;
    left: 0;
  }
  .ribbon-top-right::after {
    bottom: 0;
    right: 0;
  }
  .ribbon-top-right span {
    left: -2rem;
    top: 1rem;
    transform: rotate(45deg);
  }
</style>
<script>
import GraphBalanceSpread from '../components/GraphBalanceSpread'
import WalletAdd from '../components/WalletAdd'
function initialDataState() {
  return {
    dialogWalletAdd: false,
    walletType: null,
    wallet: null,
    opportunities: [
      {
        name: "AENCoin",
        subtitle: "The first token for investing in and carrying out research on the blockchain",
        status: "ended",
        raised: "19000000",
        requested: "22000000"
      },
      {
        name: "Promcoin",
        raised: "500000",
        status: "active",
        requested: "2000000"
      },
      {
        name: "Massive",
        raised: "100000",
        status: "active",
        requested: "200000"
      }
    ]
  }
}
export default {
  /**
   * COMPONENTS
   */
  components: {
    GraphBalanceSpread,
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
  computed: {
    online() { return this.$store.state.runtime.isOnline },
    agreedToEula() { return this.$store.state.user.eulaAgree },
    renderWatch: {
        get: function () {
            return this.$store.state.runtime.renderCounter
        },
        set: function (val) {
            this.$store.commit('setRenderCounter', val)
        }
    },
    haveEthereumWallet() { return this.$store.getters["wallet/haveWalletType"]('eth') }
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
    formatMoney(amount) {
      return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    getPercentage(partial, total) {
      return Math.floor((100 / total) * partial)
    },
    toMillion(input) { return (input / 1000000) },
    walletAdded() {
      this.dialogWalletAdd = false
      this.$store.commit('showNotification', {
        type: 'success',
        message: 'Your wallet has been successfully setup!'
      })
    }
  }
}
</script>
