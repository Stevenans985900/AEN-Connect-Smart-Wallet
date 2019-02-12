<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <!-- Wallet Management -->
      <v-card>
        <v-btn
          color="success"
          absolute
          fab
          bottom
          left
          @click="dialogWalletAdd = true"
        >
          <v-icon>add</v-icon>
        </v-btn>

        <v-card-title class="headline">
          Wallet Management
        </v-card-title>

        <v-card-text>
          <v-expansion-panel>
            <v-expansion-panel-content v-for="(wallet, address) in wallets" :key="address">
              <div slot="header" :color="walletShade(wallet)" @click="accordionTogglingWallet(wallet)">
                <v-layout>
                  <v-flex xs1 md1>
                    <wallet-image :wallet="wallet" />
                  </v-flex>
                  <v-flex xs2 md2>
                    <balance :wallet="wallet" />
                  </v-flex>
                  <v-flex xs11 md3 class="text-truncate">
                    {{ wallet.name }}
                  </v-flex>
                  <v-flex xs12 md6 class="text-xs-right">
                    <v-btn outline small @click="addressShow(wallet)">
                      Receive
                    </v-btn>
                    <v-btn v-if="wallet.onChain === true" outline small @click="transferNewShow(wallet)">
                      Send
                    </v-btn>
                    <v-btn outline small @click="dialogRemoveWallet = true">
                      Remove
                    </v-btn>
                  </v-flex>
                </v-layout>
              </div>
              <v-card>
                <v-card-text>
                  <testnet-buttons :wallet="wallet" />
                  <address-render :address="wallet.address" :use-address-book="false" />
                  <hr>
                  <wallet-history v-if="wallet.onChain === true" :wallet="wallet" />
                  <activation v-else :wallet="wallet" />
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card-text>
      </v-card>
    </v-flex>

    <!-- Show Address Dialog -->
    <v-dialog v-model="dialogAddressShow" max-width="500px">
      <v-toolbar class="primary">
        <v-toolbar-title>{{ contextWallet.name }}</v-toolbar-title>
        <v-spacer />
        <v-btn small fab outline @click="dialogAddressShow = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <business-card :wallet="contextWallet" :use-address-book="false" />
    </v-dialog>

    <!-- New Wallet Dialog -->
    <v-dialog v-model="dialogWalletAdd" persistent max-width="800px">
      <v-toolbar color="primary">
        <v-toolbar-title>Choose a wallet type to add from the list below</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="dialogWalletAdd = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-tabs centered grow>
          <v-tabs-slider color="yellow" />
          <v-tab href="#aen" @click="walletType = 'aen'">
            AEN
          </v-tab>
          <v-tab href="#eth" @click="walletType = 'eth'">
            Ethereum
          </v-tab>
          <v-tab href="#btc" @click="walletType = 'btc'">
            Bitcoin
          </v-tab>
          <v-tab v-if="haveEthereumWallet" href="#contract" @click="walletType = 'contract'">
            Custom Token
          </v-tab>
          <!-- AEN -->
          <v-tab-item value="aen">
            <v-card flat>
              <v-card-text>
                <wallet-add type="aen" @complete="walletAdded()" />
              </v-card-text>
            </v-card>
          </v-tab-item>
          <!-- ETH -->
          <v-tab-item value="eth">
            <v-card flat>
              <v-card-text>
                <wallet-add type="eth" @complete="walletAdded()" />
              </v-card-text>
            </v-card>
          </v-tab-item>
          <!-- BTC -->
          <v-tab-item value="btc">
            <v-card flat>
              <v-card-text>
                <wallet-add type="bitcoin" @complete="walletAdded()" />
              </v-card-text>
            </v-card>
          </v-tab-item>
          <!-- contract -->
          <v-tab-item v-if="haveEthereumWallet" value="contract">
            <v-card flat>
              <v-card-text>
                <wallet-add type="contract" @complete="walletAdded()" />
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-dialog>

    <!-- Make Transfer Dialog -->
    <v-dialog v-if="contextWallet.onChain" v-model="dialogMakeTransfer" persistent max-width="450px">
      <v-toolbar color="primary">
        <v-toolbar-title>Make a Transfer from {{ contextWallet.name }}</v-toolbar-title>
        <v-spacer />
        <v-btn small fab outline @click="dialogMakeTransfer = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <make-transfer :wallet="contextWallet" @complete="transferComplete()" />
    </v-dialog>

    <!-- Remove Wallet Dialog -->
    <v-dialog v-model="dialogRemoveWallet" persistent max-width="600px">
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
</template>

<script>
import Activation from '~/components/Activation'
import Balance from '~/components/Balance'
import BackupWallet from '~/components/BackupWallet'
// import VueRecaptcha from 'vue-recaptcha'
import WalletHistory from '~/components/WalletHistory'
import MakeTransfer from '~/components/MakeTransfer'
import TestnetButtons from '~/components/TestnetButtons'
import WalletAdd from '~/components/WalletAdd'

export default {
  components: {
    MakeTransfer,
    Activation,
    Balance,
    BackupWallet,
    TestnetButtons,
    WalletAdd,
    WalletHistory
  },
  data() {
    return {
      accordionWallets: [],
      dialogWalletAdd: false,
      dialogWalletView: false,
      dialogMakeTransfer: false,
      dialogReceiveTransfer: false,
      dialogRemoveWallet: false,
      dialogAddressShow: false,
      activeWatchers: [],
      walletType: 'aen',
      valid: false,
      backupAgree: false,
      newAccount: false,
      existingAccount: false,
      walletCreated: false,
      showPassword: false,
      walletName: '',
      walletPassword: '',
      contextWallet: {},
      rules: {
        required: value => !!value || 'Required.'
      },
      walletRules: {
        required: value => !!value || 'Required.',
        min: v => v.length >= 6 || 'Min 6 Characters'
      },
      passwordRules: {
        required: value => !!value || 'Required.',
        min: v => v.length >= 8 || 'Min 8 characters'
      },
      validity: {}
    }
  },
  computed: {
    environment() {
      return this.$store.state.runtime.environment
    },
    haveEthereumWallet() {
      return this.$store.getters["wallet/haveEthereumWallet"]
    },
    wallets() {
      return this.$store.state.wallet.wallets
    },
    multipleNetworks() {
      if (this.$g('aen.available_networks').length > 1) {
        return true
      }
      return false
    }
  },
  watch: {
    accordionWallets: function(val) {
      console.log('changing accordion')
      console.log(val)
      console.log(this)
    }
  },
  mounted: function () {
    console.debug('P:W:Wallets Page Started')
    // Only start once global loading finished
    const preparationInterval = setInterval(
      function () {
        clearInterval(preparationInterval)
        this.$store.commit('setLoading', { t: 'router', v: false })
      }.bind(this),
      2000
    )
  },
  methods: {
    accordionTogglingWallet(wallet) {
      this.contextWallet = wallet



      // Check whether the user security is ok
      this.$store.dispatch('security/addCheck', {
        walletAddress: wallet.address,
        context: 'wallet_open'
      }).then(() => {
        // Perform a quick test to see whether the wallet is available online or not
        this.$store.dispatch('wallet/getLiveWallet', this.contextWallet).then((response) => {
          if(response !== false) { response = true }
          this.$store.commit('wallet/setWalletProperty', {
            address: this.contextWallet.address,
            key: 'onChain',
            value: response
          })
        })
        this.dialogWalletView = true
      })
    },
    addressShow(wallet) {
      this.contextWallet = wallet
      this.dialogAddressShow = true
    },
    walletShade(wallet) {
      switch (wallet.type) {
        case 'aen':
          return '#00616d'
      }
    },
    setActiveWallet(wallet) {
      switch (wallet.type) {
        case 'aen':
          this.$walletService.walletLoad('aen', wallet)
          this.$store.commit('setAccountProperty', {
            key: 'accountPrivateKey',
            value: this.$walletService.$store.state.account.privateKey
          })
          this.$store.commit('setAccount', this.$walletService.$store.state.account)
          this.$store.commit('setActiveWallet', wallet)
          break
      }
    },
    transferNewShow(wallet) {
      this.contextWallet = wallet
      this.$store.dispatch('security/addCheck', {
        walletAddress: wallet.address,
        context: 'transaction_start'
      }).then(() => {
        this.dialogMakeTransfer = true
      })

    },
    removeWallet() {
      this.dialogRemoveWallet = false
      this.walletView = false
      this.$store.commit('wallet/removeWallet', this.contextWallet)
      this.$store.commit('showNotification', {
        type: 'success',
        message: 'Your wallet has been removed'
      })
    },
    walletAdded() {
      this.dialogWalletAdd = false
      this.$store.commit('showNotification', {
        type: 'success',
        message: 'Your wallet has been successfully setup!'
      })
    },
    transferComplete() {
      this.dialogMakeTransfer = false
    }
  }
}
</script>
