<template>
  <v-layout v-if="haveWallet" row>
    <v-flex xs12 md4 lg3>
      <v-progress-circular v-if="loading === true" indeterminate />
      <doughnut v-else :chartdata="chartdata" />
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
      <v-toolbar class="primary">
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
      <v-card>
        <span>{{ $t('common.message.results_empty') }}</span>
      </v-card>
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
    }
  },
  mounted() {
    this.processWallets()
  },
  methods: {
    processWallets() {
      this.reset()
      let color, walletKey
      // this.reset()
      for (walletKey in this.wallets) {
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
              case 'contract':
                color = this.colorSchema.contract
                break
            }
            this.chartdata.datasets[0].backgroundColor.push(color)
            this.chartdata.datasets[0].data.push(walletProcessed.balance)
            // this.chartdata.labels.push(walletProcessed.name)
            this.processedWallets++
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
    walletAdded() {
      this.dialogWalletAdd = false
      this.$store.commit('showNotification', {
        type: 'success',
        message: this.$t('wallet.message.add_sucess')
      })
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
