<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>

      <!-- Wallet Management -->
      <v-card>
        <v-card-title class="headline">Wallet Management</v-card-title>
        <v-card-text>
          <p>Show wallet spread here</p>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import BackupWallet from "../components/BackupWallet";
import UploadButton from "vuetify-upload-button";
import qrCodeGenerator from "qrcode-generator";
import VueRecaptcha from "vue-recaptcha";

export default {
  components: {
    BackupWallet,
    "upload-btn": UploadButton,
    VueRecaptcha
  },
  data() {
    return {
      valid: false,
      eulaAgree: false,
      backupAgree: false,
      proceedValid: false,
      newAccount: false,
      existingAccount: false,
      walletCreated: false,
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
    wallets() {
      return this.$stora.state.wallets;
    },
    account() {
      return this.$account.$store.state;
    },
    googleCaptchaKey() {
      return this.$g("google_recaptcha_key");
    },
    environment() {
      return this.$store.state.meta.environment;
    },
    address() {
      if (this.$account.$store.state.wallet.hasOwnProperty("address")) {
        return this.$account.$store.state.wallet.address.address;
      }
      return "";
    },
    qrData() {
      var qr = qrCodeGenerator(0, "M");
      qr.addData(this.address);
      qr.make();
      return qr.createDataURL(5);
    },
    network: {
      get: function() {
        return this.$store.state.account.network;
      },
      set: function(inputValue) {
        this.$store.commit("setNetwork", inputValue);
      }
    },
    availableNetworks() {
      return this.$g("available_networks");
    },
    rememberMe: {
      get: function() {
        return this.$store.state.meta.remember_user;
      },
      set: function(inputValue) {
        this.$store.commit("setRememberUser", inputValue);
      }
    },
    multipleNetworks() {
      if (this.$g("available_networks").length > 1) {
        return true;
      }
      return false;
    },
    walletExists() {
      return this.$store.state.meta.wallet_present;
    },
    walletName: {
      get: function() {
        return this.$store.state.account.name;
      },
      set: function(inputValue) {
        this.$store.commit("setAccountProperty", {
          key: "name",
          value: inputValue
        });
      }
    },
    walletPassword: {
      get: function() {
        return this.$store.state.account.password;
      },
      set: function(inputValue) {
        this.$store.commit("setAccountProperty", {
          key: "password",
          value: inputValue
        });
      }
    },
    privateKey: {
      get: function() {
        return this.$store.state.account.private_key;
      },
      set: function(inputValue) {
        this.$store.commit("setAccountProperty", {
          key: "private_key",
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
    console.debug("P:W:Wallets Page Started");

    if (this.environment === "production") {
      console.debug("W:Pulling in Google Recaptcha");
      let recaptchaScript = document.createElement("script");
      recaptchaScript.setAttribute(
        "src",
        "https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit"
      );
      document.head.appendChild(recaptchaScript);
    }

    // Only start once global loading finished
    var preperationInterval = setInterval(
      function() {
        if (this.$store.getters.booting === false) {
          // Redirect user to the dashboard if they already have account
          if (this.wallets) {
            console.debug(
              "W:User has saved wallet present, redirecting to dashboard"
            );
            this.$nuxt.$router.replace({ path: "/dashboard" });
          }
          clearInterval(preperationInterval);
          this.$store.commit("setLoading", { t: "router", v: false });
        }
      }.bind(this),
      2000
    );

  }
};
</script>
