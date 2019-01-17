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
          <wallet-add :main="true" type="aen" @complete="complete()"/>
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
import WalletAdd from "~/components/WalletAdd";

import { SimpleWallet } from "chain-js-sdk";
import qrCodeGenerator from "qrcode-generator";
// import VueRecaptcha from "vue-recaptcha";


export default {
  components: {

    // VueRecaptcha,
    WalletAdd
  },
  data() {
    return {
      valid: false,
      backupAgree: false,
      proceedValid: false,
      newAccount: false,
      existingAccount: false,
      walletSetup: false,
      validity: {}
    };
  },
  computed: {
    contextWallet() {
      return this.$store.state.wallet.context
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
    complete: function() {
      this.$nuxt.$router.replace({ path: "/dashboard" })
    },
    onSubmit: function() {
      this.$refs.invisibleRecaptcha.execute();
    },
    /**
     * CREATE ACCOUNT
     * Set up account in initial state to be used on the blockchain
     */

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

  }
};
</script>
