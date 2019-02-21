<template>
  <v-layout row justify-center align-center>
    <v-flex xs12 md4>
      <v-progress-circular v-if="loading === true" indeterminate />
      <doughnut v-else :chartdata="chartdata" />
    </v-flex>
    <v-flex xs12 md8>
      <v-progress-circular v-if="loading === true" indeterminate />
      <v-card v-else>
        <v-card-text>
          <v-list>
            <template v-for="(wallet, address) in wallets">
              <v-list-tile :key="address" @click="dialogShowWallet = true; contextWallet = wallet">
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

    <!-- Show Address Dialog -->
    <v-dialog v-if="contextWallet" v-model="dialogShowWallet" fullscreen="">
      <v-toolbar class="primary">
        <v-toolbar-title>{{ contextWallet.name }}</v-toolbar-title>
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
      btc: 'rgb(54, 162, 235)'
    },
    processedWallets: 0,
    // walletCount: 0,
    loading: true,
    chartdata: {
      datasets: [
        {
          backgroundColor: [],
          data: []
        }
      ],
      labels: []
    },
    contextWallet: {},
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
    faucet() {
      return this.$g('aen.faucets')[0]
    },
    wallets() {
      return this.$store.state.wallet.wallets
    },
    walletCount() {
      return Object.keys(this.wallets).length
    }

  },
  watch: {
    wallets: function () {
      this.processWallets()
    },
    processedWallets: function (value) {
      console.log('has processing finished. ' + value + ' out of ' + this.walletCount)
      if (value >= this.walletCount) {
        this.loading = false
      } else {
        this.loading = true
      }
    }
  },
  mounted() {
    this.processWallets()
  },
  methods: {
    processWallets() {
      console.log('processing wallets')
      let color, wallet, walletKey
      // this.reset()
      for (walletKey in this.wallets) {
        console.log('processing following wallet')
        console.log(wallet)
        this.$store
          .dispatch('wallet/balance', this.wallets[walletKey])
          .then((walletProcessed) => {
            switch (walletProcessed.type) {
              case 'aen':
                color = this.colorSchema.aen
                break
              case 'eth':
                color = this.colorSchema.eth
                break
              case 'btc':
                color = this.colorSchema.btc
                break
            }
            console.log('adding details of following wallet to stack')
            console.log(walletProcessed)
            this.chartdata.datasets[0].backgroundColor.push(color)
            this.chartdata.datasets[0].data.push(walletProcessed.balance)
            this.chartdata.labels.push(walletProcessed.name)
            this.processedWallets++
          })
          .catch((err) => {
            console.error(err)
            return err
          })
      }
    },
    reset() {
      Object.assign(this.$data, initialDataState())
    }
  }
}
</script>

<style>
</style>
