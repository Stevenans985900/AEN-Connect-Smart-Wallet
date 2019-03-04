<template>
  <v-layout v-if="haveWallet" row align-center>
    <v-flex xs12 sm4 lg3 pa-2>
      <v-progress-circular v-if="loading === true" indeterminate />
      <v-card v-else flat>
        <doughnut v-if="totalValue > 0" :title="chartTitle" :data="graphData" />
        <p v-else>
          {{ $t('wallet.message.blocked_until_transaction') }}
        </p>
      </v-card>
    </v-flex>
    <v-flex xs12 sm8 lg9>
      <v-progress-circular v-if="loading === true" indeterminate />
      <v-card v-else flat>
        <v-card-text>
          <v-list>
            <template v-for="(wallet, address) in wallets">
              <v-list-tile :key="address" @click="contextWallet = wallet; dialogShowWallet = true">
                <v-list-tile-avatar>
                  <wallet-image :wallet="wallet" />
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ wallet.name }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ toCurrency(wallet.balance, wallet.type) }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-flex>

    <!-- Show Wallet Dialog -->
    <v-dialog v-if="dialogShowWallet === true" v-model="dialogShowWallet" fullscreen="">
      <v-toolbar class="primary">
        <v-btn small icon outline @click="dialogShowWallet = false">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <v-toolbar-title>{{ contextWallet.name }}</v-toolbar-title>
        <v-btn v-if="contextWallet.onChain === true" small outline @click="dialogMakeTransfer = true">
          Send
        </v-btn>
        <v-btn small outline @click="dialogAddressShow = true">
          Receive
        </v-btn>
        <v-btn v-if="contextWallet.address !== mainWalletAddress" small outline @click="dialogRemoveWallet = true">
          Disable
        </v-btn>
        <v-spacer />
        <busy />
      </v-toolbar>
      <v-card>
        <v-card-text>
          <refresh-wallet :wallet="contextWallet" />
          <address-render :address="contextWallet.address" :use-address-book="false" />
          <wallet-history :wallet="contextWallet" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Show Address Dialog -->
    <v-dialog v-if="dialogAddressShow === true" v-model="dialogAddressShow" max-width="500px">
      <v-toolbar class="primary">
        <v-toolbar-title>{{ contextWallet.name }}</v-toolbar-title>
        <v-spacer />
        <v-btn small icon outline @click="dialogAddressShow = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <business-card :wallet="contextWallet" :use-address-book="false" />
    </v-dialog>

    <!-- Make Transfer Dialog -->
    <v-dialog v-if="dialogMakeTransfer === true" v-model="dialogMakeTransfer" persistent max-width="450px">
      <v-toolbar color="primary">
        <v-toolbar-title>{{ $t('wallet.make_transfer_from') }}{{ contextWallet.name }}</v-toolbar-title>
        <v-spacer />
        <v-btn small icon outline @click="dialogMakeTransfer = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <make-transfer :wallet="contextWallet" @complete="transferComplete()" />
    </v-dialog>

    <!-- Remove Wallet Dialog -->
    <v-dialog v-if="dialogRemoveWallet === true" v-model="dialogRemoveWallet" persistent max-width="600px">
      <v-toolbar color="primary">
        <v-toolbar-title>Are you sure you want to remove the wallet?</v-toolbar-title>
        <v-spacer />
        <v-btn small icon outline @click="dialogRemoveWallet = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-title class="headline">
          {{ contextWallet.name }}
        </v-card-title>
        <v-card-text>
          <p>If you remove the wallet, there will be no way to access it unless you have made a backup. Click the button below to remove </p>
          <p>If you would like to make a backup, you can do so now by clicking the button below</p>
          <backup-wallet :wallet="contextWallet" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" flat @click="dialogRemoveWallet = false">
            Cancel
          </v-btn>
          <v-btn color="blue darken-1" flat @click="removeWallet">
            Remove Wallet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
  <v-layout v-else row justify-center align-center>
    <v-flex xs12>
      <v-alert outline type="info" :value="true">
        {{ $t('common.message.results_empty') }}
      </v-alert>
    </v-flex>
  </v-layout>
</template>

<script>
import Doughnut from '~/components/Doughnut'
import WalletHistory from '~/components/WalletHistory'
import Busy from '~/components/Busy'
import RefreshWallet from '~/components/RefreshWallet'
function initialDataState() {
  return {
    processedWallets: 0,
    totalValue: 0,
    chartTitle: '',
    graphData: {},
    // walletCount: 0,
    loading: true,
    contextWallet: {},
    dialogAddressShow: false,
    dialogMakeTransfer: false,
    dialogRemoveWallet: false,
    dialogShowWallet: false,
    balanceCheckInterval: null
  }
}
export default {
  components: {
    Busy,
    Doughnut,
    RefreshWallet,
    WalletHistory
  },
  data() { return initialDataState() },
  computed: {
    haveWallet() {
      if(this.walletCount > 0) {
        return true
      }
      return false
    },
    mainWalletAddress() { return this.$store.state.wallet.aen.mainAddress },
    wallets() {
      return this.$store.state.wallet.wallets
    },
    walletCount() {
      return Object.keys(this.wallets).length
    }

  },
  watch: {
    processedWallets: function (value) {
      if (value >= this.walletCount) {
        this.loading = false
      } else {
        this.loading = true
      }
    }
  },
  mounted() {
    this.processWallets()

    this.balanceCheckInterval = setInterval(
      function () {
        // Create a wallet index map to control accordion with
        this.processWallets()
      }.bind(this),
      this.$g('internal.walletCheckInterval')
    )

  },
  beforeDestroy() {
    clearInterval(this.balanceCheckInterval)
  },
  methods: {
    processWallets() {
      this.processedWallets = 0
      this.totalValue = 0
      this.chartTitle =''
      this.graphData = {}
      let walletKey
      // this.reset()
      for (walletKey in this.wallets) {
        this.$store
          .dispatch('wallet/balance', this.wallets[walletKey])
          .then((walletProcessed) => {
            // const color = this.colorSchema[walletProcessed.type]
            // Calculate the dollar value of the wallet
            const walletValue = (walletProcessed.balance ? walletProcessed.balance * Number(this.$g('exchange.' + walletProcessed.type)) : 0)
            this.totalValue += walletValue
            this.graphData[walletProcessed.name] = walletValue
            this.processedWallets++
            this.chartTitle = 'USD ' + this.toMillion(this.totalValue) + 'M'
          })
          .catch((err) => {
            console.error(err)
            return err
          })
      }
    },
    removeWallet() {
      this.dialogRemoveWallet = false
      this.walletView = false
      this.$store.commit('wallet/removeWallet', this.contextWallet)
      this.$store.commit('showNotification', {
        type: 'success',
        message: this.$t('wallet.message.remove_sucess')
      })
    },
    toCurrency(amount, target) {
      return 'USD ' + this.toSmallestDenomination(
        (amount ? amount * Number(this.$g('exchange.' + target)) : 0 )
      )
    },
    walletAdded() {
      this.dialogWalletAdd = false
      this.$store.commit('showNotification', {
        type: 'success',
        message: this.$t('wallet.message.add_sucess')
      })
    },
    toSmallestDenomination(input) {
      let answer = input
      let suffix = ''
      // If over million, format that way
      if(input > 1000000) {
        answer = input / 1000000
        suffix = 'M'
      } else if ( input > 1000) {
        answer = input / 1000
        suffix = 'K'
      }
      // If over thousand
      return answer.toFixed(2) + suffix

    },
    toMillion(input) {
      return (input / 1000000).toFixed(2)
    },
    transferComplete() {
      this.dialogMakeTransfer = false
    },
    reset() {
      Object.assign(this.$data, initialDataState())
    }
  }
}
</script>

<style>
</style>
