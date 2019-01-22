<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <!-- Wallet Management -->
      <v-card>

        <v-btn color="success" absolute fab bottom right >{{ haveEthereumWallet }}</v-btn>

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
                <balance v-if="wallet.onChain" :wallet="wallet"/>
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
          <v-tab v-if="haveEthereumWallet" href="#erc20" @click="walletType = 'erc20'">ERC20</v-tab>

          <!-- AEN -->
          <v-tab-item value="aen">
            <v-card flat>
              <v-card-text>
                <wallet-add type="aen" @complete="walletAdded()"/>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <!-- ETH -->
          <v-tab-item value="eth">
            <v-card flat>
              <v-card-text>
                <wallet-add type="eth" @complete="walletAdded()"/>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <!-- ERC20 -->
          <v-tab-item value="erc20">
            <v-card flat>
              <v-card-text>
                <wallet-add type="erc20" @complete="walletAdded()"/>
              </v-card-text>
            </v-card>
          </v-tab-item>

        </v-tabs>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="blue darken-1" flat @click.native="dialogWalletAdd = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Wallet Dialog -->
    <v-dialog v-model="dialogViewWallet" fullscreen="">
      <v-card vwidth="600px">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialogViewWallet = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title class="white--text">{{ contextWallet.name }}</v-toolbar-title>
          <v-toolbar-items>
            <v-btn v-if="contextWallet.onChain === true" flat @click="dialogShowAddress = true">Show Business Card
            </v-btn>
            <v-btn v-if="contextWallet.onChain === true" flat @click="dialogMakeTransfer = true">Make Transfer</v-btn>
            <v-btn flat @click="dialogRemoveWallet = true">Remove Wallet</v-btn>
          </v-toolbar-items>

        </v-toolbar>
        <v-card-text>
          <testnet-buttons :wallet="contextWallet"/>
          <address-render :address="contextWallet.address"/>
          <wallet-history v-if="contextWallet.onChain === true" :wallet="contextWallet"/>
          <activation v-else :wallet="contextWallet"/>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogShowAddress" max-width="500px">
      <business-card :wallet="contextWallet"/>
    </v-dialog>

    <!-- Make Transfer Dialog -->
    <v-dialog v-model="dialogMakeTransfer" persistent max-width="600px">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="dialogMakeTransfer = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">Make a Transfer from {{ contextWallet.name }}</v-toolbar-title>
      </v-toolbar>
      <make-transfer :wallet="contextWallet" @complete="transferComplete()"/>
    </v-dialog>

    <!-- View Wallet Dialog -->
    <v-dialog v-model="dialogReceiveTransfer" persistent max-width="600px">
      <!-- Use receive transfer component here -->
      <!-- show addres -->
      <!-- show QR code -->
    </v-dialog>

    <!-- Remove Wallet Dialog -->
    <v-dialog v-model="dialogRemoveWallet" persistent max-width="600px">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="dialogRemoveWallet = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">Are you sure you want to remove the wallet?</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-title class="headline">{{ contextWallet.name }}</v-card-title>
        <v-card-text>
          <p>If you remove the wallet, there will be no way to access it unless you have made a backup. Click the button below to remove </p>
          <p>If you would like to make a backup, you can do so now by clicking the button below</p>
          <backup-wallet :wallet="contextWallet"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="blue darken-1" flat @click="dialogRemoveWallet = false">Cancel</v-btn>
          <v-btn color="blue darken-1" flat @click="removeWallet">Remove Wallet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-layout>
</template>

<script>
  import Activation from "~/components/Activation";
  import Balance from "~/components/Balance";
  import BackupWallet from "~/components/BackupWallet";
  import VueRecaptcha from "vue-recaptcha";
  import WalletHistory from "~/components/WalletHistory";
  import BusinessCard from "~/components/BusinessCard";
  import MakeTransfer from "~/components/MakeTransfer";
  import TestnetButtons from "~/components/TestnetButtons";
  import WalletAdd from "~/components/WalletAdd";

  export default {
    components: {
      MakeTransfer,
      Activation,
      Balance,
      BackupWallet,
      BusinessCard,
      TestnetButtons,
      VueRecaptcha,
      WalletAdd,
      WalletHistory
    },
    data() {
      return {
        dialogWalletAdd: false,
        dialogViewWallet: false,
        dialogMakeTransfer: false,
        dialogReceiveTransfer: false,
        dialogRemoveWallet: false,
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
      haveEthereumWallet() {
        for (let wallet in this.$store.state.wallet.wallets) {
          if (this.$store.state.wallet.wallets[wallet].type === 'eth') {
            return true
          }
        }
        return false
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
          case "aen":
            this.$walletService.walletLoad("aen", wallet);
            this.$store.commit("setAccountProperty", {
              key: "accountPrivateKey",
              value: this.$walletService.$store.state.account.privateKey
            });
            this.$store.commit("setAccount", this.$walletService.$store.state.account);
            this.$store.commit("setActiveWallet", wallet);
            break;
        }
      },
      dialogWallet(wallet) {
        this.contextWallet = wallet;
        // Perform a quick test to see whether the wallet is available online or not
        this.$store.dispatch("wallet/checkWalletLive", this.contextWallet).then(response => {
          this.$store.commit("wallet/setProperty", {
            type: "aen",
            address: this.contextWallet.address,
            key: "onChain",
            value: response
          });
        });
        this.dialogViewWallet = true;
      },
      removeWallet() {
        this.dialogRemoveWallet = false;
        this.dialogViewWallet = false;
        let removeWallet = this.contextWallet;
        this.contextWallet = {};
        this.$store.commit("wallet/removeWallet", removeWallet);
        this.$store.commit("showNotification", {
          type: "success",
          message: "Your wallet has been removed"
        });
      },
      walletAdded() {
        this.dialogWalletAdd = false;
        this.$store.commit("showNotification", {
          type: "success",
          message: "Your wallet has been successfully setup!"
        });
      },
      transferComplete() {
        this.dialogMakeTransfer = false;
      }
    }
  };
</script>
