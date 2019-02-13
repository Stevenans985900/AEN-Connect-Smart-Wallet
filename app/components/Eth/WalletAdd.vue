<template>
  <v-layout row wrap>
    <v-stepper v-model="currentStep" vertical>
      <v-stepper-step :complete="currentStep > 1" step="1">
        Add Method
        <small>Determine if you want a new Ethereum wallet or to add an existing wallet</small>
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-card>
          <v-card-text>
            <v-radio-group v-model="addType">
              <v-radio label="New Wallet" value="new" />
              <v-radio label="Import from File" value="fileImport" />
              <v-radio label="Manually enter wallet details" value="manualRecover" />
            </v-radio-group>
          </v-card-text>
        </v-card>
        <v-btn color="primary" @click="currentStep = 2">
          Continue
        </v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="currentStep > 2" step="2">
        {{ stepTwoLabel }}
      </v-stepper-step>
      <v-stepper-content step="2">
        <!-- ADD NEW WALLET -->
        <v-card v-if="addType == 'new'">
          <v-card-text>
            <v-layout row wrap>
              <v-form
                ref="newWalletForm"
                v-model="newValid"
                class="full-width"
                @submit.prevent="onSubmit"
              >
                <v-select
                  v-if="multipleNetworks"
                  v-model="network"
                  :items="availableNetworks"
                  return-object
                  item-text="name"
                  label="Network"
                />
                <v-text-field
                  v-model="walletName"
                  :rules="[rules.basic.required, rules.walletName.minLength]"
                  label="Wallet Name"
                  required
                  placeholder="ETH Wallet"
                />
                <v-text-field
                  v-model="walletPassword"
                  :append-icon="showPassword ? 'visibility_off' : 'visibility'"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="[rules.basic.required, rules.password.minLength]"
                  label="Wallet Password"
                  required
                  counter
                  @click:append="showPassword = !showPassword"
                />
              </v-form>
            </v-layout>
          </v-card-text>
        </v-card>

        <v-card v-if="addType == 'fileImport'">
          <v-card-text>
            <v-layout row wrap>
              <restore-from-file @complete="walletRestoredFromFile" />
            </v-layout>
          </v-card-text>
        </v-card>

        <v-card v-if="addType == 'manualRecover'">
          <v-card-text>
            <v-layout row wrap>
              <v-form ref="existingWalletForm" v-model="recoverValid" class="full-width">
                <v-select
                  v-if="multipleNetworks"
                  v-model="network"
                  :items="availableNetworks"
                  return-object
                  item-text="name"
                  label="Network"
                />
                <v-text-field
                  v-model="walletName"
                  :rules="[rules.basic.required, rules.walletName.minLength]"
                  label="Wallet Name"
                  required
                  placeholder="Ethereum Wallet"
                />
                <v-text-field
                  v-model="privateKey"
                  :rules="[rules.basic.required, rules.privateKey.length]"
                  label="Private Key"
                  required
                  counter
                />
                <v-text-field
                  v-model="walletPassword"
                  :append-icon="showPassword ? 'visibility_off' : 'visibility'"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="[rules.basic.required, rules.password.minLength]"
                  label="Wallet Password"
                  required
                  counter
                  @click:append="showPassword = !showPassword"
                />
              </v-form>
            </v-layout>
          </v-card-text>
        </v-card>

        <v-btn v-if="addType == 'new'" color="primary" @click="createWallet">
          Create
        </v-btn>
        <v-btn v-if="addType == 'manualRecover'" color="primary" @click="loadWallet">
          Recover
        </v-btn>

        <v-btn flat @click="back">
          Back
        </v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="currentStep > 3" step="3">
        Summary
        <small>Review your wallet</small>
      </v-stepper-step>
      <v-stepper-content step="3">
        <v-layout row wrap>
          <v-flex xs12 md6>
            <h1>Wallet Created: {{ wallet.name }}</h1>
            <p>
              With this wallet, you can now receive and transfer tokens using the Ethereum network network. Before proceeding,
              we strongly recommend you create a backup of your wallet using the button below.
            </p>
            <p>
              With this Ethereum wallet, you are now also able to add custom tokens which will appear as an individual wallet,
              also showing up on the transaction history. In the case of contracts that this wallet interacts with, in the case
              of being a receiver, they will automatically be added, using the same password (by default) as this wallet
            </p>
            <backup-wallet :wallet="wallet" />
            <v-form ref="backupForm" v-model="proceedValid">
              <v-checkbox
                v-model="backupAgree"
                :rules="[rules.basic.required]"
                required
                label="I have backed up my wallet / understand that keeping it safe is my duty"
              />
              <p>
                At the moment, your wallet is not live on the network. It is necessary to perform a transaction using
                this address before it has any presence.
              </p>
              <v-btn :disabled="!proceedValid" color="primary" @click="complete">
                Complete
              </v-btn>
            </v-form>
          </v-flex>
          <v-flex xs12 md6>
            <business-card :wallet="wallet" :include-private-key="true" :use-addrress-book="false" />
          </v-flex>
        </v-layout>
      </v-stepper-content>
    </v-stepper>
  </v-layout>
</template>

<script>
import BackupWallet from '~/components/BackupWallet'
import RestoreFromFile from '~/components/RestoreFromFile'

function initialDataState() {
  return {
    addType: 'new',
    backupAgree: false,
    currentStep: 1,
    newValid: false,
    recoverValid: false,
    transactions: {},
    loading: true,
    network: {},
    walletName: '',
    walletPassword: '',
    privateKey: '',
    proceedValid: false,
    showPassword: false,
    showEula: false,
    wallet: {},
    rules: {
      basic: {
        required: value => !!value || 'Required.'
      },
      walletName: {
        minLength: v => v.length >= 4 || 'Min 4 Characters'
      },
      password: {
        minLength: v => v.length >= 8 || 'Min 8 characters'
      },
      privateKey: {
        length: v => (v.length >= 64 || v.length <= 66) || 'Length is 66 Characters'
      }
    }
  }
}
export default {
  components: {
    BackupWallet,
    RestoreFromFile
  },
  props: {
    main: {
      type: Boolean,
      default: function () {
        return false
      }
    }
  },
  data: function () {
    return initialDataState()
  },
  computed: {
    availableNetworks() {
      return this.$g('eth.available_networks')
    },
    stepTwoLabel() {
      if (this.addType === 'fileImport') {
        return 'File Import'
      }
      return 'Enter Details'
    },
    multipleNetworks() {
      if (this.$g('eth.available_networks').length > 1) {
        return true
      }
      return false
    }
  },
  beforeMount() {
    if (this.multipleNetworks === false) {
      this.network = this.$g('eth.available_networks')[0]
    }
  },
  methods: {
    back() {
      this.currentStep--
    },
    beforeMount() {
      this.reset()
    },
    complete() {
      this.$emit('complete', true)
      this.reset()
    },
    createWallet() {
      if (!this.$refs.newWalletForm.validate()) {
        console.log('form is invalid')
        return false
      }

      const walletOptions = {
        type: 'eth',
        network: this.network,
        name: this.walletName,
        password: this.walletPassword,
        main: this.main
      }
      this.$store.dispatch('wallet/new', walletOptions).then((wallet) => {
        this.wallet = wallet
        this.currentStep++
        this.startLiveListener(wallet)
      })
    },
    loadWallet() {
      if (!this.$refs.existingWalletForm.validate()) {
        return false
      }
      this.$store
        .dispatch('wallet/load', {
          type: 'eth',
          network: this.network,
          name: this.walletName,
          password: this.walletPassword,
          privateKey: this.privateKey
        })
        .then((wallet) => {
          this.wallet = wallet
          this.currentStep++
          this.startLiveListener(wallet)
        })
    },
    reset() {
      Object.assign(this.$data, initialDataState())
    },
    startLiveListener(wallet) {
      // Activate a listener on the wallet to check when it is live on the network
      const walletCheckInterval = setInterval(
        function () {
          this.$store
            .dispatch('wallet/getLiveWallet', wallet).then((response) => {
              if (response !== false) {
                this.$store.commit('wallet/setWalletProperty', {
                  address: wallet.address,
                  key: 'onChain',
                  value: true
                })
              clearInterval(walletCheckInterval)
              }
            })
        }.bind(this),
        this.$store.state.wallet.internal.walletCheckInterval
      )
    },
    /**
     * Event listener for the
     * @param wallet
     */
    walletRestoredFromFile(wallet) {
      this.wallet = wallet
      this.currentStep++
      if (wallet.hasOwnProperty('onChain')) {
        if (wallet.onChain === false) {
          this.startLiveListener(wallet)
        }
      }
    }
  }
}
</script>
