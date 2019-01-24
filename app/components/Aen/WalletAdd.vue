<template>
  <v-layout row wrap align-center>
    <v-flex xs12>
      <v-stepper v-model="currentStep" vertical>

        <v-stepper-step :complete="currentStep > 1" step="1">
          Add Method
          <small>Determine if you want a new AEN wallet or to add an existing wallet</small>
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
          <v-btn color="primary" @click="currentStep = 2">Continue</v-btn>
        </v-stepper-content>

        <v-stepper-step :complete="currentStep > 2" step="2" >
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
                    :items="availableNetworks"
                    v-model="network"
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
                    :items="availableNetworks"
                    v-model="network"
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


          <v-btn v-if="addType == 'new'" color="primary" @click="createWallet">Create</v-btn>
          <v-btn v-if="addType == 'manualRecover'" color="primary" @click="loadWallet">Recover</v-btn>


          <v-btn flat @click="back">Back</v-btn>
        </v-stepper-content>

        <v-stepper-step :complete="currentStep > 3" step="3">Summary
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
                <v-checkbox v-if="main == true" v-model="eulaAgree" :rules="[rules.basic.required]" required>
                  <span slot="label">
                    I agree to the
                    <a href="http://aencoin.com/eula">AEN EULA</a>
                  </span>
                </v-checkbox>

                <backup-wallet :wallet="wallet"/>
              </v-form>
            </v-card-text>
          </v-card>
          <v-btn :disabled="!proceedValid" color="primary" @click="complete">Complete</v-btn>
        </v-stepper-content>

      </v-stepper>
    </v-flex>
  </v-layout>
</template>

<script>
import BusinessCard from "~/components/BusinessCard"
import BackupWallet from "~/components/BackupWallet"
import RestoreFromFile from "~/components/RestoreFromFile"

// TODO Approaching level of abstraction where no need for full network components. when have time, complete
function initialDataState () {
  return {
    addType: 'new',
    backupAgree: false,
    currentStep: 1,
    newValid: false,
    recoverValid: false,
    transactions: {},
    loading: true,
    walletName: '',
    walletPassword: '',
    accountPrivateKey: '',
    proceedValid: false,
    showPassword: false,
    showEula: false,
    wallet: {},
    rules: {
      basic: {
        required: value => !!value || "Required."
      },
      walletName: {
        minLength: v => v.length >= 4 || "Min 4 Characters"
      },
      password: {
        minLength: v => v.length >= 8 || "Min 8 characters"
      },
      privateKey: {
        length: v => v.length === 64 || "Length is 64 Characters"
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
      default: function() {
        return false
      }
    }
  },
  data: function () { return initialDataState() },
  computed: {
    availableNetworks() {
      return this.$g("aen.available_networks");
    },
    stepTwoLabel() {
      if(this.addType === 'fileImport') {
        return 'File Import'
      }
      return 'Enter Details'
    },
    environment() {
      return this.$store.state.meta.environment;
    },
    eulaAgree: {
      get: function() { return this.$store.state.meta.eulaAgree },
      set: function(val) { this.$store.commit('setMeta', {key: 'eulaAgree', value: val}) }
    },
    googleCaptchaKey() {
      return this.$g("google_recaptcha_key");
    },
    multipleNetworks() {
      if (this.$g("aen.available_networks").length > 1) {
        return true;
      }
    },
    network: {
      get: function() {
        return this.$store.state.wallet.context.network;
      },
      set: function(inputValue) {
        this.$store.commit("wallet/setNetwork", inputValue);
      }
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
    },
    complete() {
      this.$emit('complete', this.wallet)
      this.reset()
    },
    createWallet() {
      if (!this.$refs.newWalletForm.validate()) {
        return false
      }
      let walletOptions = {
        type: 'aen',
        network: this.$store.state.wallet.context.network,
        name: this.walletName,
        password: this.walletPassword,
        main: this.main
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
        console.log("form is invalid");
        return false;
      }
      this.$store.dispatch('wallet/load',{
          type: 'aen',
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
      let walletCheckInterval = setInterval(
        function() {
          this.$store.dispatch('wallet/checkWalletLive', wallet).then(response => {
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
      console.log('picked up event after wallet creation')
      console.log(wallet)
      this.wallet = wallet
      this.currentStep++
      if(wallet.hasOwnProperty('onChain')) {
        if(wallet.onChain === false) {
          this.startLiveListener(wallet)
        }
      }
    }
  }
}
</script>
