<template>
  <v-container>
    <v-layout row justify-center align-center>
      <v-flex xs12>
        <v-toolbar class="primary">
          <v-toolbar-title>
            Wallet Management
          </v-toolbar-title>
          <v-spacer />
          <backup-wallet :show-icon="true" />
          <v-btn color="success" @click="dialogWalletAdd = true">
            <v-icon>add</v-icon>Add Wallet
          </v-btn>
        </v-toolbar>
        <!-- Wallet Management -->
        <v-card>
          <v-card-text>
            <v-expansion-panel>
              <v-expansion-panel-content v-for="(wallet, address) in wallets" :key="address">
                <div slot="header" :color="walletShade(wallet)" @click="accordionTogglingWallet(wallet)">
                  <v-layout row wrap>
                    <v-flex xs2 sm1>
                      <wallet-image :wallet="wallet" />
                    </v-flex>

                    <v-flex xs7 sm5 class="text-truncate">
                      <v-layout row wrap>
                        <v-flex xs12 sm6>
                          {{ wallet.name }}
                        </v-flex>
                        <v-flex xs12 sm6>
                          <balance :wallet="wallet" />
                        </v-flex>
                      </v-layout>
                    </v-flex>

                    <v-flex v-if="$vuetify.breakpoint.mdAndUp" xs3 sm6 class="text-xs-right">
                      <v-btn v-if="wallet.onChain === true" outline small @click="contextWallet = wallet; dialogMakeTransfer = true">
                        Send
                      </v-btn>
                      <v-btn outline small @click="addressShow(wallet)">
                        Receive
                      </v-btn>
                      <v-btn outline class="error" small @click="contextWallet = wallet; dialogRemoveWallet = true">
                        Remove
                      </v-btn>
                    </v-flex>
                    <v-flex v-else xs3 sm6 class="text-xs-right">
                      <v-menu offset-y>
                        <v-btn
                          slot="activator"
                          outline
                          small
                        >
                          Actions
                        </v-btn>
                        <v-list>
                          <v-list-tile v-if="wallet.onChain === true" @click="contextWallet = wallet; dialogMakeTransfer = true">
                            <v-list-tile-title>Send</v-list-tile-title>
                          </v-list-tile>
                          <v-list-tile @click="addressShow(wallet)">
                            <v-list-tile-title>Receive</v-list-tile-title>
                          </v-list-tile>
                          <v-list-tile @click="contextWallet = wallet; dialogRemoveWallet = true">
                            <v-list-tile-title>Remove</v-list-tile-title>
                          </v-list-tile>
                        </v-list>
                      </v-menu>
                    </v-flex>
                  </v-layout>
                </div>
                <v-card>
                  <v-card-text>
                    <testnet-buttons :wallet="wallet" />
                    <address-render :address="wallet.address" :use-address-book="false" />
                    <wallet-history v-if="wallet.onChain === true" :wallet="wallet" />
                    <activation v-else :wallet="wallet" />
                    <hr>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card-text>
        </v-card>
      </v-flex>

      <!-- Show Address Dialog -->
      <v-dialog v-if="dialogAddressShow === true" v-model="dialogAddressShow" max-width="500px">
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
      <v-dialog v-model="dialogWalletAdd" persistent max-width="1024px">
        <v-toolbar color="primary">
          <v-toolbar-title>Choose a wallet type:</v-toolbar-title>
          <v-btn outline :class="{ 'info': walletType == 'aen'}" @click="walletType = 'aen'">
            AEN
          </v-btn>
          <v-btn outline :class="{ 'info': walletType == 'eth'}" @click="walletType = 'eth'">
            ETH
          </v-btn>
          <v-btn outline :class="{ 'info': walletType == 'btc'}" @click="walletType = 'btc'">
            BTC
          </v-btn>
          <v-btn v-if="haveEthereumWallet" outline :class="{ 'info': walletType == 'contract'}" @click="walletType = 'contract'">
            Contract
          </v-btn>
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

      <!-- Make Transfer Dialog -->
      <v-dialog v-if="dialogMakeTransfer === true" v-model="dialogMakeTransfer" persistent max-width="450px">
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
  </v-container>
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

function initialDataState() {
  return {
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
    contextWallet: null,
    accordionControlMap: [],
    accordionControlling: false,
    accordionCurrentPosition: 0,
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
}
export default {
  components: {
    Activation,
    BackupWallet,
    Balance,
    MakeTransfer,
    TestnetButtons,
    WalletAdd,
    WalletHistory
  },
  data() { return initialDataState() },
  head() {
    return {
      title: 'AENConnect Smart Wallet - Wallet Management',
      meta: [
        { hid: 'description', name: 'description', content: 'Manage your various wallets and make transfers' }
      ]
    }
  },
  computed: {
    environment() {
      return this.$store.state.runtime.environment
    },
    haveEthereumWallet() {
      return this.$store.getters["wallet/haveWalletType"]('ethereum')
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
  mounted: function () {
    console.debug('P:W:Wallets Page Started')
    // Only start once global loading finished
    const preparationInterval = setInterval(
      function () {
        // Create a wallet index map to control accordion with
        clearInterval(preparationInterval)
        this.$store.commit('setLoading', { t: 'router', v: false })
      }.bind(this),
      this.$g('internal.controllerPollReadyInterval')
    )
  },
  methods: {
    accordionTogglingWallet(wallet) {
      this.contextWallet = wallet
      // Check whether the user security is ok
      if(this.contextWallet.onChain === false) {
        const walletLiveCheckInterval = setInterval(
          function () {
            this.$store.dispatch('wallet/getLiveWallet', this.contextWallet).then((response) => {
              if(response !== false) {
                this.$store.commit('wallet/setWalletProperty', {
                  address: this.contextWallet.address,
                  key: 'onChain',
                  value: true
                })
                clearInterval(walletLiveCheckInterval)
              }
            })
          }.bind(this),
          this.$g('internal.commonTasksInterval')
        )
      }
      this.dialogWalletView = true
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
