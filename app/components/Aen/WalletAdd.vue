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
          Review your wallet
        </v-stepper-step>
        <v-stepper-content step="3">
          <v-layout row wrap>
            <v-flex xs12 md6>
              <h1>Wallet Created: {{ wallet.name }}</h1>
              <p>
                With this wallet, you can now receive and transfer tokens using the AENChain network. Before proceeding,
                we strongly recommend you create a backup of your wallet using the button below.
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
    </v-flex>
  </v-layout>
</template>

<script>
import BackupWallet from '~/components/BackupWallet'
import RestoreFromFile from '~/components/RestoreFromFile'

// TODO Approaching level of abstraction where no need for full network components. when have time, complete
function initialDataState() {
  return {
    addType: 'new',
    backupAgree: false,
    currentStep: 1,
    newValid: false,
    recoverValid: false,
    walletName: '',
    walletPassword: '',
    network: {},
    accountPrivateKey: '',
    proceedValid: false,
    showPassword: false,
    wallet: {},
    rules: {
      basic: {
        required: value => !!value || 'Required.'
      },
      walletName: {
        minLength: v => v.length >= 4 || 'Min 4 Characters'
        // TODO Add the unique rule back in here
        // unique: (v, vm) => !vm.$store.wallet.wallets.hasOwnProperty(v) || "Wallet name must be unique"
      },
      password: {
        minLength: v => v.length >= 8 || 'Min 8 characters'
      },
      privateKey: {
        length: v => v.length === 64 || 'Length is 64 Characters'
      }
    }
  }
}

export default {
  /**
   * COMPONENTS
   */
  components: {
    BackupWallet,
    RestoreFromFile
  },
  /**
   * DATA
   */
  data: function () { return initialDataState() },
  /**
   * COMPUTED
   */
  computed: {
    networks() { return this.$g('aen.available_networks') },
    stepTwoLabel() {
      if (this.addType === 'fileImport') {
        return 'Select file for import'
      }
      return 'Fill in form information'
    },
    environment() { return this.$store.state.runtime.environment },
    googleCaptchaKey() { return this.$g('google_recaptcha_key') },
    multipleNetworks() {
      if (this.$g('aen.available_networks').length > 1) {
        return true
      }
      return false
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
    beforeMount() {
      this.reset()
      this.network = this.$store.state.wallet.aen.network

      if (this.$store.state.runtime.environment === 'production') {
        console.debug('Pulling in Google Recaptcha for production')
        const recaptchaScript = document.createElement('script')
        recaptchaScript.setAttribute(
          'src',
          'https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit'
        )
        document.head.appendChild(recaptchaScript)
      }
    },
    complete() {
      this.$emit('complete', this.wallet)
      this.reset()
    },
    createWallet() {
      if (!this.$refs.newWalletForm.validate()) {
        return false
      }
      const walletOptions = {
        type: 'aen',
        network: this.$store.state.wallet.aen.network,
        name: this.walletName,
        password: this.walletPassword
      }
      this.$store.dispatch('wallet/new', walletOptions)
        .then((wallet) => {
          this.wallet = wallet
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
        type: 'aen',
        network: this.$store.state.wallet.aen.network,
        name: this.walletName,
        password: this.walletPassword,
        accountPrivateKey: this.accountPrivateKey
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

            if (response !== false) {
              this.$store.commit('wallet/setWalletProperty', {
                wallet: wallet,
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
