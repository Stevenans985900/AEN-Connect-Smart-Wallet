<template>
  <v-layout v-if="haveWallet" row>
    <v-flex xs12 lg3 class="ml-2">
      <v-progress-circular v-if="loading === true" indeterminate />
      <doughnut v-else :title="chartTitle" :data="graphData"/>
    </v-flex>
    <v-flex xs12 md8 lg9>
      <v-progress-circular v-if="loading === true" indeterminate />
      <v-card flat v-else>
        <v-card-text>
          <v-list>
            <template v-for="(wallet, address) in wallets">
              <v-list-tile :key="address" @click="contextWallet = wallet; dialogShowWallet = true">
                <v-list-tile-avatar>
                  <wallet-image :wallet="wallet" />
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ wallet.name }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ wallet.balance }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-flex>

    <!-- Show Wallet Dialog -->
    <v-dialog v-if="dialogShowWallet" v-model="dialogShowWallet" fullscreen="">
      <v-toolbar class="primary mb-2">
        <v-toolbar-title>{{ contextWallet.name }}</v-toolbar-title>
        <v-btn v-if="contextWallet.onChain === true" @click="dialogMakeTransfer = true">
          Send
        </v-btn>
        <v-btn @click="addressShow(contextWallet)">
          Receive
        </v-btn>
        <v-btn v-if="contextWallet.address !== mainWalletAddress" @click="dialogRemoveWallet = true">
          Disable
        </v-btn>
        <v-spacer />
        <v-btn small fab outline @click="dialogShowWallet = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <address-render :address="contextWallet.address" :use-address-book="false" />
          <wallet-history :wallet="contextWallet" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Make Transfer Dialog -->
    <v-dialog v-if="dialogMakeTransfer === true" v-model="dialogMakeTransfer" persistent max-width="450px">
      <v-toolbar color="primary">
        <v-toolbar-title>{{ $t('wallet.make_transfer_from') }}{{ contextWallet.name }}</v-toolbar-title>
        <v-spacer />
        <v-btn small fab outline @click="dialogMakeTransfer = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <make-transfer :wallet="contextWallet" @complete="transferComplete()" />
    </v-dialog>

    <!-- Remove Wallet Dialog -->
    <v-dialog v-if="dialogRemoveWallet" v-model="dialogRemoveWallet" persistent max-width="600px">
      <v-toolbar color="primary">
        <v-toolbar-title>Are you sure you want to remove the wallet?</v-toolbar-title>
        <v-spacer />
        <v-btn small fab outline @click="dialogRemoveWallet = false">
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

function initialDataState() {
  return {
    colorSchema: {
      aen: 'rgb(255, 99, 132)',
      eth: 'rgb(54, 162, 235)',
      contract: 'rgb(54, 162, 235)',
      btc: 'rgb(54, 162, 235)'
    },
    processedWallets: 0,
    totalValue: 0,
    chartTitle: '',
    graphData: {},
    // walletCount: 0,
    loading: true,
    contextWallet: {},
    dialogMakeTransfer: false,
    dialogRemoveWallet: false,
    dialogShowWallet: false
  }
}
export default {
  components: {
    Doughnut,
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
    },
    wallets: {
      handler: function() { this.processWallets() },
      deep: true
    }
  },
  mounted() {
    this.processWallets()
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
            const walletValue = walletProcessed.balance * this.$g('exchange.' + walletProcessed.type)
            this.totalValue += walletValue
            console.log('total value: '+this.totalValue)
            this.graphData[walletProcessed.name] = walletValue
            this.processedWallets++
            this.chartTitle = 'USD ' + this.toMillion(this.totalValue) + 'M'
          })
          .catch((err) => {
            console.error(err)
            return err
          })
      }

      console.log('CHART TITLE: ' + this.chartTitle)
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
    walletAdded() {
      this.dialogWalletAdd = false
      this.$store.commit('showNotification', {
        type: 'success',
        message: this.$t('wallet.message.add_sucess')
      })
    },
    toMillion(input) {
      console.log('TO MILLION: ' + input)
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
