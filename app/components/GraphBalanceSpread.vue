<template>
  <v-layout row justify-center align-center>
    <v-flex xs12 md4>
      <v-progress-circular v-if="loading === true" indeterminate />
      <doughnut v-else :chartdata="chartdata" />
    </v-flex>
    <v-flex xs12 md8>
      <v-progress-circular v-if="loading === true" indeterminate />
      <v-card v-else>
        <v-card-text v-if="haveLiveWallet == true">
          <v-list>
            <template v-for="(wallet, address) in wallets">
              <v-list-tile v-if="wallet.onChain == true" :key="address" @click="showWallet(wallet)">
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
        <v-card-text v-else>
          <h1>No Active wallets found</h1>
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
export default {
  components: {
    Doughnut,
    WalletHistory
  },
  data() {
    return {
      colorSchema: {
        aen: 'rgb(255, 99, 132)',
        eth: 'rgb(54, 162, 235)',
        btc: 'rgb(54, 162, 235)'
      },
      haveLiveWallet: false,
      processedWallets: 0,
      walletCount: 0,
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
  },
  computed: {
    faucet() {
      return this.$g('aen.faucets')[0]
    },
    wallets() {
      return this.$store.state.wallet.wallets
    }

  },
  watch: {
    contextWallet: {
      handler: function () {
        this.processWallets()
      },
      deep: true
    },
    wallets: function () {
      this.processWallets()
    },
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
  },
  methods: {
    processWallets() {
      let color, wallet
      this.processedWallets = 0
      const vm = this
      this.walletCount = Object.keys(this.wallets).length
      for (wallet in this.wallets) {
        if (this.wallets[wallet].onChain === true) {
          this.haveLiveWallet = true
          this.$store
            .dispatch('wallet/balance', this.wallets[wallet])
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

              if (walletProcessed.hasOwnProperty('balance')) {
                vm.chartdata.datasets[0].backgroundColor.push(color)
                vm.chartdata.datasets[0].data.push(walletProcessed.balance)
                vm.chartdata.labels.push(walletProcessed.name)
              }
              vm.processedWallets++
            })
            .catch((err) => {
              console.log('catching "error"')
              console.error(err)
              return err
            })
        } else {
          this.processedWallets++
        }
      }
    },
    showWallet(wallet) {
      this.dialogShowWallet = true
      this.contextWallet = wallet
    }
  }
}
</script>

<style>
</style>
