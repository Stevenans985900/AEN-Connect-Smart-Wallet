<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
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
                {{ wallet.type }}
                <!--<v-icon :class="[item.iconClass]">{{ item.icon }}</v-icon>-->
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title>{{ wallet.name }}</v-list-tile-title>
                <v-list-tile-sub-title class="text--primary">{{ address }}</v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action>{{ balance(wallet) }}</v-list-tile-action>
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
    <v-dialog v-model="dialogViewWallet" persistent max-width="600px">
      <v-card width="600px">
        <v-card-title>{{ walletBalance(contextWallet) }}<br >{{ contextWallet.name }}<br >{{ contextWallet.address }}</v-card-title>
        <v-card-text>

          <wallet-history v-if="contextWallet.onChain === true" :wallet="contextWallet" />
          <template v-else>
            <p>The wallet is not yet active, please make a transfer to the wallet.</p>
            <p>If you have already made a transfer, it is possible the network has not yet detected it. To manually check click the following button</p>
            <v-btn @click="checkWalletLive(contextWallet)">Click here</v-btn>
            <p>If you are still getting the message even after being sure a transfer has taken place, please get in contact with us at <a href="mailto:support@aencoin.io">support@aencoin.io</a>!</p>
          </template>

        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click="dialogMakeTransfer = true">Make Transfer</v-btn>
          <v-btn color="primary" flat @click="dialogReceiveTransfer = true">Receive Transfer</v-btn>
          <v-btn color="primary" flat @click="dialogViewWallet = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Make Transfer Dialog -->
    <v-dialog v-model="dialogMakeTransfer" persistent max-width="600px">
      <!-- Use make transfer component here -->
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
import BackupWallet from "../components/BackupWallet";
import VueRecaptcha from "vue-recaptcha";
import WalletHistory from '../components/WalletHistory';

export default {
  components: {
    BackupWallet,
    VueRecaptcha,
    WalletHistory
  },
  data() {
    return {
      dialogWalletAdd: false,
      dialogViewWallet: false,
      dialogMakeTransfer: false,
      dialogReceiveTransfer: false,
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
    balance(wallet) {
      console.log(this.$store.getters['wallet/balance'](wallet))
      this.$store.getters['wallet/balance'](wallet).then(response => {
        return response
      })
    },
    checkWalletLive(wallet) {
      this.$store.dispatch('wallet/checkWalletLive', wallet).then(response => {
        this.$store.commit('wallet/setProperty', {
          address: wallet.address,
          key: 'onChain',
          value: response
        })
        if(response === true) {
          this.$store.commit("showNotification", {
            type: "success",
            message: "The wallet is recognised on the blockchain"
          })
        } else {
          this.$store.commit("showNotification", {
            type: "info",
            message: "The wallet is not yet recognised on the blockchain"
          })
        }
      })


      console.log('pass here')
    },
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
      let options = {}
      switch (this.walletType) {
        case "eth":
          options = {
            name: this.walletName
          }
          break
        case "aen":
        default:
          options = {
            network: this.$store.state.activeWallet.network,
            name: this.walletName,
            password: this.walletPassword
          }
          break;

      }
      let wallet = this.$walletService.walletNew(this.walletType, options)
      this.$store.commit('addWallet', wallet)
      this.$store.commit("showNotification", {
        type: "success",
        message: "Your wallet has been successfully setup!"
      })
    },
    walletBalance(wallet) {
      return this.$walletService.getBalance(wallet) || 0
    },
  }
};
</script>
