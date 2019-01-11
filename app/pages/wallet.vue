<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <!-- Wallet Management -->
      <v-card>

        <v-btn color="success" absolute fab bottom left @click="dialogWalletAdd = true">
          <v-icon>add</v-icon>
        </v-btn>

        <v-card-title class="headline">Wallet Management</v-card-title>
        <v-card-text>
          <v-list two-line subheader>
            <v-list-tile v-for="(wallet, address) in wallets" :key="address" avatar @click="dialogWallet(wallet)">
              <v-list-tile-avatar>
                <img :src="'/network/' + wallet.type + '.png'">
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title>{{ wallet.name }}</v-list-tile-title>
                <!--<v-list-tile-sub-title class="text&#45;&#45;primary"></v-list-tile-sub-title>-->
              </v-list-tile-content>

              <v-list-tile-action>
                <balance v-if="wallet.onChain" :wallet="wallet" />
                <span v-else>NA</span>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card-text>
      </v-card>
    </v-flex>

    <!-- New Wallet Dialog -->
    <v-dialog v-model="dialogWalletAdd" persistent max-width="600px">
      <v-card>
        <v-tabs centered color="cyan" dark icons-and-text>
          <v-tabs-slider color="yellow"/>
          <v-tab href="#aen" @click="walletType = 'aen'">AEN</v-tab>
          <v-tab href="#eth" @click="walletType = 'eth'">ETH</v-tab>

          <!-- AEN -->
          <v-tab-item value="aen">
            <v-card flat>
              <v-form ref="aen-form" v-model="valid" class="full-width" @submit.prevent="onSubmit">
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
                  @verify="createAccount"
                />
              </v-form>
            </v-card>
          </v-tab-item>

          <!-- ETH -->
          <v-tab-item value="eth">
            <v-card flat>
              <v-form ref="eth-form" v-model="valid" class="full-width" @submit.prevent="onSubmit">
                <v-text-field
                  v-model="walletName"
                  :rules="[walletRules.required, walletRules.min]"
                  label="Wallet Name"
                  required
                  placeholder="AEN Wallet"
                />
                <h1>Have a means of generating extra entropy here</h1>
              </v-form>
            </v-card>
          </v-tab-item>
        </v-tabs>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="blue darken-1" flat @click.native="dialogWalletAdd = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="generateWallet">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Wallet Dialog -->
    <v-dialog v-model="dialogViewWallet" fullscreen="">
      <v-card width="600px">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialogViewWallet = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title class="white--text">{{ contextWallet.name }}</v-toolbar-title>
          <v-toolbar-items v-if="contextWallet.onChain === true">
            <v-btn flat @click="dialogShowAddress = true">Show Business Card</v-btn>
            <v-btn flat @click="dialogMakeTransfer = true">Make Transfer</v-btn>
            <v-btn flat @click="dialogReceiveTransfer = true">Receive Transfer</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <h1 class="text-xs-center">{{ contextWallet.address }}</h1>
          <wallet-history v-if="contextWallet.onChain === true" :wallet="contextWallet" />
          <activation v-else :wallet="contextWallet" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogShowAddress" max-width="400px">
      <business-card :wallet="contextWallet" />
    </v-dialog>
    <!-- Make Transfer Dialog -->
    <v-dialog v-model="dialogMakeTransfer" persistent max-width="600px">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="dialogMakeTransfer = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">Make a Transfer from {{ contextWallet.name }}</v-toolbar-title>
      </v-toolbar>
      <make-transfer :wallet="contextWallet" />
    </v-dialog>

    <!-- View Wallet Dialog -->
    <v-dialog v-model="dialogReceiveTransfer" persistent max-width="600px">
      <!-- Use receive transfer component here -->
      <!-- show addres -->
      <!-- show QR code -->
    </v-dialog>
  </v-layout>
</template>

<script>
import Activation from "../components/Activation"
import Balance from "../components/Balance"
import BackupWallet from "../components/BackupWallet";
import VueRecaptcha from "vue-recaptcha";
import WalletHistory from '../components/WalletHistory';
import BusinessCard from '../components/BusinessCard';
import MakeTransfer from "../components/MakeTransfer";

export default {
  components: {
    MakeTransfer,
    Activation,
    Balance,
    BackupWallet,
    BusinessCard,
    VueRecaptcha,
    WalletHistory
  },
  data() {
    return {
      dialogWalletAdd: false,
      dialogViewWallet: false,
      dialogMakeTransfer: false,
      dialogReceiveTransfer: false,
      dialogShowAddress: false,
      activeWatchers: [],
      walletType: "aen",
      valid: false,
      eulaAgree: false,
      backupAgree: false,
      newAccount: false,
      existingAccount: false,
      walletCreated: false,
      showPassword: false,
      walletName: "",
      walletPassword: "",
      contextWallet: {},
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
    environment() {
      return this.$store.state.meta.environment;
    },
    wallets() {
      return this.$store.state.wallet.wallets;
    },
    multipleNetworks() {
      if (this.$g("aen.available_networks").length > 1) {
        return true;
      }
    }
  },
  mounted: function() {
    console.debug("P:W:Wallets Page Started");
    // Only start once global loading finished
    var preperationInterval = setInterval(
      function() {
        clearInterval(preperationInterval);
        this.$store.commit("setLoading", { t: "router", v: false });
      }.bind(this),
      2000
    );
  },
  methods: {
    setActiveWallet(wallet) {
      switch (wallet.type) {
        case 'aen':
          this.$walletService.walletLoad('aen', wallet)
          this.$store.commit("setAccountProperty", {
            key: "accountPrivateKey",
            value: this.$walletService.$store.state.account.privateKey
          });
          this.$store.commit("setAccount", this.$walletService.$store.state.account);
          this.$store.commit("setActiveWallet", wallet);
          break;
      }
    },
    dialogWallet (wallet) {
      this.contextWallet = wallet
      this.dialogViewWallet = true
    },
    /**
     * Create a new wallet on one of the various networks
     */
    generateWallet() {
      // Make sure that the form being submitted is valid

      let formRef = this.walletType+'-form'
      if (!this.$refs[formRef].validate()) {
        return;
      }

      let options = {
        name: this.walletName
      }
      switch (this.walletType) {
        case "eth":

          break
        case "aen":
        default:
          options.type = 'aen'
          options.network = this.$store.state.wallet.context.network
          options.password = this.walletPassword
          break;

      }
      this.$store.dispatch('wallet/new', options).then((wallet) => {
        console.debug(wallet)
        this.$store.commit("showNotification", {
          type: "success",
          message: "Your wallet has been successfully setup!"
        })
      })

    }
  }
};
</script>
