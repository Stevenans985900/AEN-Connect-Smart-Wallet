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
              <upload-button :file-changed-callback="backupUploaded" title="Choose file">
                <template slot="icon">
                  <v-icon>attach_file</v-icon>
                </template>
              </upload-button>
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

  </v-layout>
</template>

<script>
import BusinessCard from "~/components/BusinessCard"
import EventEmitter from "events"
import isElectron from "is-electron"
import CryptoJS from "crypto-js"
import UploadButton from "vuetify-upload-button"
import BackupWallet from "~/components/BackupWallet"

export default {
  components: {
    BackupWallet,
    BusinessCard,
    UploadButton
  },
  props: {
    main: {
      type: Boolean,
      default: function() {
        return false
      }
    }
  },
  data() {
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
          required: value => !!value || "Required."
        },
        walletName: {
          minLength: v => v.length >= 4 || "Min 4 Characters"
        },
        password: {
          minLength: v => v.length >= 8 || "Min 8 characters"
        },
        privateKey: {
          length: v => v.length == 66 || "Length is 66 Characters"
        }
      },
    }
  },
  computed: {
    availableNetworks() {
      return this.$g("eth.available_networks");
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
      if (this.$g("eth.available_networks").length > 1) {
        return true;
      }
      return false
    }
  },
  mounted() {
    if(this.multipleNetworks === false) {
      this.network = this.$g("eth.available_networks")[0]
    }
  },
  methods: {
    back() {
      this.currentStep--
    },
    complete() {
      this.$emit('complete', true)
    },
    createWallet() {

      if (!this.$refs.newWalletForm.validate()) {
        console.log("form is invalid");
        return false;
      }

      let walletOptions = {
        type: 'eth',
        network: this.network,
        name: this.walletName,
        password: this.walletPassword,
        main: this.main
      }
      this.$store.dispatch('wallet/new', walletOptions)
      .then((wallet) => {
        console.debug(wallet)
        this.wallet = wallet
        this.currentStep++

        // Activate a listener on the wallet to check when it is live on the network
        let walletCheckInterval = setInterval(
          function() {
            this.$store.dispatch('wallet/checkWalletLive', this.wallet).then(response => {
              this.$store.commit('wallet/setProperty', {
                address: this.wallet.address,
                key: 'onChain',
                value: response
              });
              if (response === true) {
                clearInterval(walletCheckInterval)
              }
            })
          }.bind(this),
          this.$g('internal.walletCheckInterval')
        );
      })
    },
    loadWallet() {
      if (!this.$refs.existingWalletForm.validate()) {
        console.log("form is invalid");
        return false;
      }
      this.$store.dispatch('wallet/load',{
          type: 'eth',
          network: this.network,
          name: this.walletName,
          password: this.walletPassword,
          privateKey: this.privateKey
        }
      ).then((wallet) => {
        this.wallet = wallet
        console.debug(wallet)
        this.currentStep++

        // Activate a listener on the wallet to check when it is live on the network
        let walletCheckInterval = setInterval(
          function() {
            this.$store.dispatch('wallet/checkWalletLive', this.wallet).then(response => {
              this.$store.commit('wallet/setProperty', {
                address: this.wallet.address,
                key: 'onChain',
                value: response
              });
              if (response === true) {
                clearInterval(walletCheckInterval)
              }
            })
          }.bind(this),
          this.$g('internal.walletCheckInterval')
        );
      })
    },
    /**
     *
     * @param file
     */
    backupUploaded(file) {

      // Create the construct to handle both app / browser situations
      const fileUploadedEmitter = new EventEmitter();
      fileUploadedEmitter.on(
        "ready",
        function(walletData) {
          try {
            console.debug(walletData.fileName)
            let extension = walletData.fileName.split('.').pop();
            let walletInformation

            if(extension === 'enc') {
              var bytes  = CryptoJS.AES.decrypt(walletData.data, this.$g('salt'));
              walletInformation = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
            } else {
              walletInformation = JSON.parse(walletData.data);
            }
            console.log(walletInformation)

            this.$store.dispatch('wallet/load', walletInformation).then((wallet) => {
              this.wallet = wallet
              this.currentStep++
            })
          } catch (e) {
            this.$store.commit("showNotification", {
              type: "error",
              message: 'The file you uploaded appears invalid, please make sure it is a wallet backup'
            })
          }
        }.bind(this)
      );

      // Fork condition depending on the environment
      // TODO If come across more of these conditions, put them in to facade
      if (isElectron()) {
        console.debug("BU:Using local file mode");
        const fs = require("fs");
        fs.readFile(file.path, "utf8", (err, data) => {
          if (err) throw err;
          fileUploadedEmitter.emit("ready", {data: data, fileName: file.name});
        });
      } else {
        console.log("BU:Using HTML file API");
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(event) {
          fileUploadedEmitter.emit("ready", {data: event.target.result, fileName: file.name});
        };
      }
    }
  }
}
</script>
