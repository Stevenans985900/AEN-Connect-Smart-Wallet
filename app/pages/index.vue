<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <!-- Initial setup -->
      <v-card>
        <v-card-title class="headline">Welcome to AEN Smart Wallet ({{ network.name }})</v-card-title>
        <v-card-text>
          <p>
            This Smart wallet allows you to generate and manage accounts on the
            <a
              href="https://aencoin.com/"
              target="_blank"
            >AENChain network</a>
          </p>
          <p>Before proceeding, you need to have an AEN wallet setup on this device. Please choose one of the options below</p>
          <p>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                color="success"
                @click="newAccount = !newAccount"
              >Create a New Wallet</v-btn>
              <span>To obtain an address and generate a private key.</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                color="info"
                @click="existingAccount = !existingAccount"
              >Access an Existing Wallet</v-btn>
              <span>To send tokens and swap coins.</span>
            </v-tooltip>
          </p>
          <hr>

          <v-layout>
            <!-- control -->
            <v-flex v-if="walletSetup === false" xs12 md6>
              <!-- Setup wallet for new account -->
              <v-card v-if="newAccount" class="text-xs-center">
                <v-card-text>
                  <v-layout row wrap>
                    <v-form
                      ref="newWalletForm"
                      v-model="valid"
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
                        :rules="[walletRules.required, walletRules.min]"
                        label="Wallet Name"
                        required
                        placeholder="AEN Wallet"
                      />
                      <v-text-field
                        v-model="walletPassword"
                        :append-icon="showPassword ? 'visibility_off' : 'visibility'"
                        :type="showPassword ? 'text' : 'password'"
                        :rules="[passwordRules.required, passwordRules.min]"
                        label="Wallet Password"
                        required
                        counter
                        @click:append="showPassword = !showPassword"
                      />
                      <vue-recaptcha
                        v-if="environment === 'Production'"
                        ref="recaptcha"
                        :sitekey="googleCaptchaKey"
                        @verify="createWallet"
                      />
                      <v-btn v-else @click="createWallet">Create Account</v-btn>
                    </v-form>
                  </v-layout>
                </v-card-text>
              </v-card>

              <!-- Setup wallet from existing account -->
              <v-card v-if="existingAccount" class="text-xs-center">
                <v-card-text>
                  <v-layout row wrap>
                    <v-form ref="existingWalletForm" v-model="valid" class="full-width">
                      <upload-btn :file-changed-callback="backupUploaded" title="Restore from file">
                        <template slot="icon">
                          <v-icon>attach_file</v-icon>
                        </template>
                      </upload-btn>
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
                        :rules="[walletRules.required, walletRules.min]"
                        label="Wallet Name"
                        required
                        placeholder="AEN Wallet"
                      />
                      <v-text-field v-model="privateKey" label="Private Key" required/>
                      <v-text-field
                        v-model="walletPassword"
                        :append-icon="showPassword ? 'visibility_off' : 'visibility'"
                        :type="showPassword ? 'text' : 'password'"
                        :rules="[passwordRules.required, passwordRules.min]"
                        label="Wallet Password"
                        required
                        counter
                        @click:append="showPassword = !showPassword"
                      />
                      <v-btn @click="loadWallet">Load</v-btn>
                    </v-form>
                  </v-layout>
                </v-card-text>
              </v-card>
            </v-flex>

            <v-flex v-if="walletSetup" xs12 md6>
              <v-card class="text-xs-center">
                <v-card-text>
                  <business-card :wallet="contextWallet" />
                </v-card-text>
              </v-card>
            </v-flex>

            <!-- summary information column -->
            <v-flex v-if="walletSetup" xs12 md6 class="text-xs-center">
              <v-card>
                <v-card-text>
                  <v-form ref="form" v-model="proceedValid">
                    <v-checkbox
                      v-model="backupAgree"
                      :rules="[rules.required]"
                      required
                      label="I have backed up my wallet and understand that keeping it safe is my duty"
                    />
                    <v-checkbox v-model="eulaAgree" :rules="[rules.required]" required>
                      <span slot="label">
                        I agree to the
                        <a href="http://aencoin.com/eula">AEN EULA</a>
                      </span>
                    </v-checkbox>
                    
                    <backup-wallet :wallet="contextWallet"/>
                    <v-btn :disabled="!proceedValid" to="/dashboard">Continue</v-btn>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-flex>
            <v-flex v-else xs12 md6 class="text-xs-center">
              <v-card>
                <v-card-text v-if="newAccount">
                  <p>When you create a new wallet, you aren't part of the network until a transaction involving your address has been completed and becoming part of the ledger</p>
                  <img src="/new.png" alt="new wallet" >
                </v-card-text>
                <v-card-text v-if="existingAccount">
                  <p>To restore a wallet, you'll need to know both your private key and the password.</p>
                  <img src="/restore.png" alt="restore wallet" >
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<style>
.full-width {
  width: 100% !important;
}
</style>
<script>
import BackupWallet from "../components/BackupWallet";
import BusinessCard from "../components/BusinessCard";
import { SimpleWallet } from "chain-js-sdk";
import UploadButton from "vuetify-upload-button";
import EventEmitter from "events";
import qrCodeGenerator from "qrcode-generator";
import VueRecaptcha from "vue-recaptcha";
import isElectron from "is-electron";
import CryptoJS from "crypto-js"

export default {
  components: {
    BackupWallet,
    BusinessCard,
    "upload-btn": UploadButton,
    VueRecaptcha
  },
  data() {
    return {
      valid: false,
      backupAgree: false,
      proceedValid: false,
      newAccount: false,
      existingAccount: false,
      walletSetup: false,
      showPassword: false,
      rules: {
        required: value => !!value || "Required."
      },
      walletRules: {
        required: value => !!value || "Required.",
        min: v => v.length >= 6 || "Min 6 Characters"
      },
      passwordRules: {
        required: value => !!value || "Required.",
        min: v => v.length >= 8 || "Min 8 characters"
      },
      validity: {}
    };
  },
  computed: {
    contextWallet() {
      return this.$store.state.wallet.context
    },
    eulaAgree: {
      get: function() { return this.$store.state.meta.eulaAgree },
      set: function(val) { this.$store.commit('setMeta', {key: 'eulaAgree', value: val}) }
    },
    googleCaptchaKey() {
      return this.$g("google_recaptcha_key");
    },
    environment() {
      return this.$store.state.meta.environment;
    },
    address() {
      return this.$store.state.wallet.context.address
    },
    qrData() {
      var qr = qrCodeGenerator(0, "M");
      qr.addData(this.address);
      qr.make();
      return qr.createDataURL(5);
    },
    network: {
      get: function() {
        return this.$store.state.wallet.context.network;
      },
      set: function(inputValue) {
        this.$store.commit("wallet/setNetwork", inputValue);
      }
    },
    availableNetworks() {
      return this.$g("aen.available_networks");
    },
    rememberMe: {
      get: function() {
        return this.$store.state.meta.rememberUser;
      },
      set: function(inputValue) {
        this.$store.commit("setRememberUser", inputValue);
      }
    },
    multipleNetworks() {
      if (this.$g("aen.available_networks").length > 1) {
        return true;
      }
    },
    walletName: {
      get: function() {
        return this.$store.state.wallet.context.name;
      },
      set: function(inputValue) {
        this.$store.commit("wallet/setContextProperty", {
          key: "name",
          value: inputValue
        });
      }
    },
    walletPassword: {
      get: function() {
        return this.$store.state.wallet.context.password;
      },
      set: function(inputValue) {
        this.$store.commit("wallet/setContextProperty", {
          key: "password",
          value: inputValue
        });
      }
    },
    privateKey: {
      get: function() {
        return this.$store.state.wallet.context.privateKey;
      },
      set: function(inputValue) {
        this.$store.commit("wallet/setContextProperty", {
          key: "privateKey",
          value: inputValue
        });
      }
    }
  },
  watch: {
    newAccount: function(value) {
      if (value === true) {
        this.existingAccount = false;
      }
    },
    existingAccount: function(value) {
      if (value === true) {
        this.newAccount = false;
      }
    }
  },
  mounted: function() {
    console.debug("Index Page: Started");

    if (this.environment === "production") {
      console.debug("Pulling in Google Recaptcha");
      let recaptchaScript = document.createElement("script");
      recaptchaScript.setAttribute(
        "src",
        "https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit"
      );
      document.head.appendChild(recaptchaScript);
    }

    // Check if there is a network set and use the first available
    if (Object.keys(this.$store.state.wallet.context.network).length === 0) {
      console.debug("Index Page: Setting a default network to first available");
      this.network = this.availableNetworks[0];
    }

    // Only start once global loading finished
    let intervalBooting = setInterval(
      function() {
        if (this.$store.getters.booting === false) {
          // Redirect user to the dashboard if they already have account
          if (this.$store.state.wallet.context.address) {
            console.debug(
              "I:User has saved wallet present, redirecting to dashboard"
            );
            this.$nuxt.$router.replace({ path: "/dashboard" });
          }
          clearInterval(intervalBooting)
          this.$store.commit("setLoading", { t: "router", v: false });
        }
      }.bind(this),
      2000
    );
  },
  methods: {
    onSubmit: function() {
      this.$refs.invisibleRecaptcha.execute();
    },
    /**
     * CREATE ACCOUNT
     * Set up account in initial state to be used on the blockchain
     */
    createWallet() {

      if (!this.$refs.newWalletForm.validate()) {
        console.log("form is invalid");
        return false;
      }

      this.$store.dispatch('wallet/new',{
        type: 'aen',
        network: this.$store.state.wallet.context.network,
        name: this.$store.state.wallet.context.name,
        password: this.$store.state.wallet.context.password,
        main: true
        }
      ).then((wallet) => {
        console.debug(wallet)
        this.walletSetup = true
        this.$store.commit("showNotification", {
          type: "success",
          message: "Your wallet has been successfully setup!"
        })

        let walletCheckInterval = setInterval(
          function() {
            this.$store.dispatch('wallet/checkWalletLive', this.$store.state.wallet.context).then(response => {
              this.$store.commit('wallet/setProperty', {
                address: this.$store.state.wallet.context.address,
                key: 'onChain',
                value: response
              });
              if (response === true) {
                clearInterval(walletCheckInterval)
              }
            })
          }.bind(this),
          this.$store.state.wallet.internal.walletCheckInterval
        );
      })
    },
    /**
     *
     */
    loadWallet() {

      if (!this.$refs.existingWalletForm.validate()) {
        console.log("form is invalid");
        return false;
      }

      this.$store.dispatch('wallet/load',{
          type: 'aen',
          accountPrivateKey: this.$store.state.wallet.context.accountPrivateKey,
          network: this.$store.state.wallet.context.network,
          name: this.$store.state.wallet.context.name,
          password: this.$store.state.wallet.context.password,
          main: true
        }
      ).then((wallet) => {
        console.debug(wallet)
        this.$store.commit("showNotification", {
          type: "success",
          message: "Your wallet has been successfully setup!"
        })

        let walletCheckInterval = setInterval(
          function() {
            this.$store.dispatch('wallet/checkWalletLive', this.$store.state.wallet.context).then(response => {
              this.$store.commit('wallet/setProperty', {
                address: this.$store.state.wallet.context.address,
                key: 'onChain',
                value: response
              });
              if (response === true) {
                clearInterval(walletCheckInterval)
              }
            })
          }.bind(this),
          this.$store.state.wallet.internal.walletCheckInterval
        );

        this.$nuxt.$router.replace({ path: "/dashboard" });

      })


      console.debug("F:LW:Load Wallet");
      this.$account.regenerate_account(
        this.$store.state.activeWallet.private_key,
        this.$store.state.activeWallet.network.byte
      );
      this.$account.open_wallet(
        this.$store.state.activeWallet.name,
        this.$store.state.activeWallet.password,
        this.$store.state.activeWallet.private_key,
        this.$store.state.activeWallet.network.byte
      );
      // Load the wallet key in to state storage for reuse
      this.$store.commit("setContextProperty", {
        key: "wallet_private_key",
        value: this.$account.$store.state.wallet.encryptedPrivateKey
          .encryptedKey
      });

      // Check if wallet creation was successful
      var message = "Something went wrong during wallet regeneration";
      if (this.$account.$store.state.wallet instanceof SimpleWallet) {
        console.debug("CA:Wallet successfully generated");
        if (this.rememberMe === true) {
          console.debug(
            "CA:Remember me option selected, saving details to store"
          );
          this.$store.commit("setAccount", this.$account.$store.state.account);
          this.$store.commit("setWallet", this.$account.$store.state.wallet);
        } else {
          this.$store.commit("setAccountStatus", true);
        }
        this.walletSetup = true;
        message = "Your wallet has been successfully regenerated!";
        this.$store.commit("showNotification", {
          type: "success",
          message: message
        });
        this.$nuxt.$router.replace({ path: "/dashboard" });
      } else {
        this.$store.commit("showNotification", {
          type: "error",
          message: message
        });
      }
    },
    backupUploaded(file) {

      // Create the construct to handle both app / browser situations
      const fileUploadedEmitter = new EventEmitter();
      fileUploadedEmitter.on(
        "ready",
        function(walletData) {
          var message =
            "The file you uploaded appears invalid, please make sure it is a wallet backup";
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

            this.$store.commit("wallet/setContext", walletInformation)

            this.$store.commit("showNotification", {
              type: "info",
              message: "Backup loaded"
            });
          } catch (e) {
            this.$store.commit("showNotification", {
              type: "error",
              message: message
            });
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
};
</script>
