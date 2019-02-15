<template>
  <v-layout row wrap align-center>
    <v-flex xs12>
      <v-stepper v-model="currentStep" vertical>
        <v-stepper-step :complete="currentStep > 1" step="1">
          How do you want to add your wallet?
        </v-stepper-step>
        <v-stepper-content step="1">
          <v-card>
            <v-card-text>
              <v-radio-group v-model="addType">
                <v-radio label="Create a New Wallet right now" value="new" />
                <v-radio label="Import an existing wallet from file" value="fileImport" />
                <v-radio label="Manually enter wallet private key and password" value="manualRecover" />
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
                    placeholder="AEN Wallet"
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

                  <!--<vue-recaptcha-->
                  <!--v-if="environment === 'Production'"-->
                  <!--ref="recaptcha"-->
                  <!--:sitekey="googleCaptchaKey"-->
                  <!--@verify="createWallet"-->
                  <!--/>-->
                </v-form>
              </v-layout>
            </v-card-text>
          </v-card>

          <v-card v-if="addType == 'fileImport'">
            <v-card-text>
              <v-layout row wrap>
                <restore-from-file :main="true" @complete="walletRestoredFromFile" />
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
                    placeholder="AEN Wallet"
                  />
                  <v-text-field
                    v-model="accountPrivateKey"
                    :rules="[rules.basic.required, rules.privateKey.length]"
                    label="Account Private Key"
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
          <v-card>
            <v-card-text>
              <business-card :wallet="wallet" />
              <v-form ref="eulaForm" v-model="proceedValid">
                <v-checkbox
                  v-model="backupAgree"
                  :rules="[rules.basic.required]"
                  required
                  label="I have backed up my wallet and understand that keeping it safe is my duty"
                />
                <backup-wallet :wallet="wallet" />
              </v-form>
            </v-card-text>
          </v-card>
          <v-btn :disabled="!proceedValid" color="primary" @click="complete">
            Complete
          </v-btn>
        </v-stepper-content>
      </v-stepper>
    </v-flex>
  </v-layout>
</template>

<script>
import BusinessCard from '~/components/BusinessCard'
import BackupWallet from '~/components/BackupWallet'
import RestoreFromFile from '~/components/RestoreFromFile'

function initialDataState() {
  return {
    addType: 'new',
    backupAgree: false,
    currentStep: 1,
    newValid: false,
    recoverValid: false,
    loading: true,
    walletName: '',
    proceedValid: false,
    showPassword: false,
    walletPassword: '',
    wallet: {},
    rules: {
      basic: {
        required: value => !!value || 'Required.'
      },
      password: {
        minLength: v => v.length >= 8 || 'Min 8 characters'
      },
      walletName: {
        minLength: v => v.length >= 4 || 'Min 4 Characters'
      },
      privateKey: {
        length: v => v.length === 64 || 'Length is 64 Characters'
      }
    }
  }
}

export default {
  components: {
    BackupWallet,
    BusinessCard,
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
  data: function () { return initialDataState() },
  computed: {
    availableNetworks() {
      return this.$g('bitcoin.available_networks')
    },
    stepTwoLabel() {
      if (this.addType === 'fileImport') {
        return 'File Import'
      }
      return 'Enter Details'
    },
    multipleNetworks() {
      if (this.$g('bitcoin.available_networks').length > 1) {
        return true
      }
      return false
    }
  },
  beforeMount() {
    this.reset()
    if (this.multipleNetworks === false) {
      this.network = this.$g('bitcoin.available_networks')[0]
    }
  },
  methods: {
    back() {
      this.currentStep--
    },
    /**
     * Make sure the data is clean for adding a new wallet before trying to render the HTML.
     * @param file
     */
    complete() {
      this.$emit('complete', this.wallet)
      this.reset()
    },
    createWallet() {
      if (!this.$refs.newWalletForm.validate()) {
        return false
      }
      const walletOptions = {
        type: 'btc',
        network: this.network,
        name: this.walletName,
        main: this.main
      }
      this.$store.dispatch('wallet/new', walletOptions)
        .then((wallet) => {
          this.currentStep++
          this.startLiveListener(wallet)
        })
    },
    loadWallet() {
      if (!this.$refs.existingWalletForm.validate()) {
        console.log('form is invalid')
        return false
      }
      this.$store.dispatch('wallet/load', {
        type: 'btc',
        network: this.$store.state.wallet.context.network,
        name: this.walletName,
        password: this.walletPassword,
        accountPrivateKey: this.accountPrivateKey,
        main: this.main
      }
      ).then((wallet) => {
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
          this.$store.dispatch('wallet/getLiveWallet', wallet).then((response) => {
            if (response === true) {
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
