<template>
  <v-container>
    <v-layout row justify-center align-center>
      <v-flex xs12>
        <v-toolbar class="primary mb-2">
          <v-toolbar-title>
            {{ $t('common.navigation.wallet_management') }}
          </v-toolbar-title>
          <v-spacer />
          <template v-if="$vuetify.breakpoint.mdAndUp">
            <backup-wallet :show-icon="true" />
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
                <!--<v-list-tile @click="walletType = 'btc'; dialogWalletAdd = true">-->
                <!--<v-list-tile-title>{{ $t('network.label.btc') }}</v-list-tile-title>-->
                <!--</v-list-tile>-->
                <v-list-tile v-if="haveEthereumWallet" @click="walletType = 'contract'; dialogWalletAdd = true">
                  <v-list-tile-title>{{ $t('network.contract') }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </template>
          <!--:close-on-click="false"-->
          <v-menu v-else offset-y :close-on-content-click="false">
            <v-btn
              slot="activator"
              small
              icon
            >
              <v-icon>
                menu
              </v-icon>
            </v-btn>
            <v-list>
              <v-list>
                <backup-wallet :show-icon="true" />
                <v-divider />
                <v-subheader>Add Wallet</v-subheader>
                <v-list-tile @click="walletType = 'aen'; dialogWalletAdd = true">
                  <v-list-tile-title>{{ $t('network.label.aen') }}</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="walletType = 'eth'; dialogWalletAdd = true">
                  <v-list-tile-title>{{ $t('network.label.eth') }}</v-list-tile-title>
                </v-list-tile>
                <!--<v-list-tile @click="walletType = 'btc'; dialogWalletAdd = true">-->
                <!--<v-list-tile-title>{{ $t('network.label.btc') }}</v-list-tile-title>-->
                <!--</v-list-tile>-->
                <v-list-tile v-if="haveEthereumWallet" @click="walletType = 'contract'; dialogWalletAdd = true">
                  <v-list-tile-title>{{ $t('network.contract') }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-list>
          </v-menu>
        </v-toolbar>
        <!-- Wallet Management -->
        <v-card v-bar>
          <v-card-text v-if="haveWallet" style="max-height: 75vh;">
            <v-expansion-panel popout>
              <v-expansion-panel-content v-for="(wallet, address) in wallets" :key="address">
                <!-- Main Table Row -->
                <div slot="header" @click="accordionTogglingWallet(wallet)">
                  <v-layout row wrap>
                    <v-flex xs3 sm1 class="text-xs-left">
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
                    <!-- Wallet Controls -->
                    <v-flex v-if="$vuetify.breakpoint.mdAndUp" xs2 sm6 class="text-xs-right">
                      <v-btn v-if="wallet.onChain === true" outline small @click="contextWallet = wallet; dialogMakeTransfer = true">
                        {{ $t('common.action.send') }}
                      </v-btn>
                      <v-btn outline small @click="addressShow(wallet)">
                        {{ $t('common.action.receive') }}
                      </v-btn>
                      <v-btn v-if="wallet.address !== mainWalletAddress" outline class="error" small @click="contextWallet = wallet; dialogRemoveWallet = true">
                        {{ $t('common.action.disable') }}
                      </v-btn>
                    </v-flex>
                    <!-- Mobile Button -->
                    <v-flex v-else xs2 sm6 class="text-xs-right">
                      <v-menu offset-y>
                        <v-btn
                          slot="activator"
                          small
                          icon
                        >
                          <v-icon>
                            menu
                          </v-icon>
                        </v-btn>
                        <v-list>
                          <v-list-tile v-if="wallet.onChain === true" @click="contextWallet = wallet; dialogMakeTransfer = true">
                            <v-list-tile-title>{{ $t('common.action.send') }}</v-list-tile-title>
                          </v-list-tile>
                          <v-list-tile @click="addressShow(wallet)">
                            <v-list-tile-title>{{ $t('common.action.receive') }}</v-list-tile-title>
                          </v-list-tile>
                          <v-list-tile v-if="wallet.address !== mainWalletAddress" @click="contextWallet = wallet; dialogRemoveWallet = true">
                            <v-list-tile-title>{{ $t('common.action.disable') }}</v-list-tile-title>
                          </v-list-tile>
                        </v-list>
                      </v-menu>
                    </v-flex>
                  </v-layout>
                </div>
                <!-- Wallet expansion details. Only try to render the section if selected to avoid unnecessary proc -->
                <v-card v-if="selectedWalletAddress == address">
                  <v-card-text>
                    <v-layout row wrap>
                      <v-flex xs12 md3>
                        <refresh-wallet :wallet="wallet" />
                      </v-flex>
                      <v-flex xs12 md3>
                        <testnet-buttons :wallet="wallet" />
                      </v-flex>
                      <v-flex xs12 md6>
                        <address-render :address="wallet.address" :use-address-book="false" :use-receiver-address="true" />
                      </v-flex>
                      <v-flex xs12>
                        <wallet-history v-if="wallet.onChain === true" :wallet="wallet" />
                        <activation v-else :wallet="wallet" />
                      </v-flex>
                    </v-layout>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card-text>
          <v-card-text v-else>
            <v-alert outline type="info" :value="true">
              {{ $t('common.message.results_empty') }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-flex>

      <!-- Show Address Dialog -->
      <v-dialog v-if="dialogAddressShow === true" v-model="dialogAddressShow" max-width="500px">
        <v-toolbar class="primary">
          <v-toolbar-title>{{ contextWallet.name }}</v-toolbar-title>
          <v-spacer />
          <v-btn small icon outline @click="dialogAddressShow = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <business-card :wallet="contextWallet" :use-address-book="false" :include-private-key="true" />
      </v-dialog>

      <!-- New Wallet Dialog -->
      <v-dialog v-if="dialogWalletAdd === true" v-model="dialogWalletAdd" persistent max-width="650px">
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

      <!-- Make Transfer Dialog -->
      <v-dialog v-if="dialogMakeTransfer === true" v-model="dialogMakeTransfer" persistent max-width="450px">
        <v-toolbar color="primary">
          <v-toolbar-title>{{ $t('wallet.label.transfer_from') }}{{ contextWallet.name }}</v-toolbar-title>
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
          <v-toolbar-title>{{ $t('common.message.are_you_sure') }}</v-toolbar-title>
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
            <p>
              {{ $t('wallet.message.remove_warning') }}
            </p>
            <backup-wallet :wallet="contextWallet" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" flat @click="dialogRemoveWallet = false">
              {{ $t('common.action.cancel') }}
            </v-btn>
            <v-btn color="blue darken-1" flat @click="removeWallet">
              {{ $t('common.action.confirm') }}
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
import RefreshWallet from '~/components/RefreshWallet'
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
    walletType: null,
    valid: false,
    backupAgree: false,
    newAccount: false,
    existingAccount: false,
    walletCreated: false,
    selectedWalletAddress: null,
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
    RefreshWallet,
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
    mainWalletAddress() { return this.$store.state.wallet.aen.mainAddress },
    environment() {
      return this.$store.state.runtime.environment
    },
    haveEthereumWallet() {
      return this.$store.getters["wallet/haveWalletType"]('ethereum')
    },
    wallets() {
      return this.$store.state.wallet.wallets
    },
    haveWallet() {
      return (Object.keys(this.wallets).length > 0 ? true : false)
    },
    multipleNetworks() {
      if (this.$g('aen.available_networks').length > 1) {
        return true
      }
      return false
    }
  },
  mounted: function () {
    this.$log.debug('Wallet Management Startup')
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
      this.selectedWalletAddress = wallet.address
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
