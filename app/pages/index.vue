<template>
  <v-container>
    <!-- WALLETS -->
    <v-layout row wrap align-center mb-4>
      <v-flex xs12>
        <v-toolbar class="primary">
          <v-toolbar-title>{{ $t('common.label.wallets') }}</v-toolbar-title>
          <v-spacer />
          <v-menu offset-y>
            <v-btn slot="activator" color="success">
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
              <v-list-tile v-if="haveEthereumWallet" @click="walletType = 'contract'; dialogWalletAdd = true">
                <v-list-tile-title>{{ $t('network.contract') }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-toolbar>
        <v-card flat>
          <graph-balance-spread />
        </v-card>
      </v-flex>
      <!-- New Wallet Dialog -->
      <v-dialog v-if="dialogWalletAdd" v-model="dialogWalletAdd" persistent max-width="1024px">
        <v-toolbar color="primary">
          <v-toolbar-title>{{ $t('wallet.action_add') }}</v-toolbar-title>
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
      <v-flex xs12 md4>
        <v-toolbar class="primary">
          <v-toolbar-title>{{ $t('common.label.icos') }}</v-toolbar-title>
        </v-toolbar>
        <v-card v-for="(ico, index) in icos" :key="index" mb-2>
          <v-card-title v-if="ico.status" class="ribbon ribbon-top-right">
            <span>{{ $t('ico.label.status_' + ico.status) }}</span>
          </v-card-title>
          <v-card-text>
            {{ ico.name }} <span v-if="ico.subtitle">
              : {{ ico.subtitle }}
            </span>
          </v-card-text>
          <v-card-actions>
            <v-list-tile class="grow">
              <v-list-tile-content>
                <v-list-tile-title>
                  <v-icon class="mr-1">
                    attach_money
                  </v-icon>
                  <span class="subheading">
                    {{ ico.raised }}
                  </span>
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style scoped>
  /* common */
  .ribbon {
    width: 10rem;
    height: 10rem;
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
    background-color: #3498db;
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
    top: 2rem;
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
    icos: [
      {
        name: "AENCoin",
        subtitle: "The first token for investing in and carrying out research on the blockchain",
        status: "ended",
        raised: "US15M / US22M"
      },
      {
        name: "Promcoin",
        raised: "US1M / US5M"
      },
      {
        name: "Massive",
        raised: "US1 / US50M"
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
    haveEthereumWallet() {
      return this.$store.getters["wallet/haveWalletType"]('ethereum')
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
