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
                <wallet-image :wallet="wallet" />
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
      <v-toolbar color="primary">
        <v-btn icon @click="dialogWalletAdd = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Choose a wallet type to add from the list below</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-tabs centered grow>
          <v-tabs-slider color="yellow"/>
          <v-tab href="#aen" @click="walletType = 'aen'">AEN</v-tab>
          <v-tab href="#eth" @click="walletType = 'eth'">Ethereum</v-tab>
          <v-tab href="#btc" @click="walletType = 'btc'">Bitcoin</v-tab>
          <v-tab v-if="haveEthereumWallet" href="#contract" @click="walletType = 'contract'">Custom Token</v-tab>

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
          <!-- BTC -->
          <v-tab-item value="btc">
            <v-card flat>
              <v-card-text>
                <wallet-add type="bitcoin" @complete="walletAdded()"/>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <!-- contract -->
          <v-tab-item value="contract">
            <v-card flat>
              <v-card-text>
                <wallet-add type="contract" @complete="walletAdded()"/>
              </v-card-text>
            </v-card>
          </v-tab-item>

        </v-tabs>
      </v-card>
    </v-dialog>

    <!-- View Wallet Dialog -->
    <v-dialog v-model="dialogViewWallet" fullscreen="">
      <v-toolbar class="primary">
        <v-toolbar-title>{{ contextWallet.name }}</v-toolbar-title>
        <v-toolbar-items>
          <v-btn v-if="contextWallet.onChain === true" flat @click="dialogShowAddress = true">Show Business Card
          </v-btn>
          <v-btn v-if="contextWallet.onChain === true" flat @click="dialogMakeTransfer = true">Make Transfer</v-btn>
          <v-btn flat @click="dialogRemoveWallet = true">Remove Wallet</v-btn>
        </v-toolbar-items>
        <v-spacer />
        <v-btn icon @click="dialogViewWallet = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card width="600px">
        <v-card-text>
          <testnet-buttons :wallet="contextWallet"/>
          <address-render :address="contextWallet.address"/>
          <wallet-history v-if="contextWallet.onChain === true" :wallet="contextWallet"/>
          <activation v-else :wallet="contextWallet"/>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogShowAddress" max-width="500px">
      <v-toolbar class="primary">
        <v-toolbar-title>{{ contextWallet.name }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="dialogShowAddress = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <business-card :wallet="contextWallet" :use-address-book="false"/>
    </v-dialog>

    <!-- Make Transfer Dialog -->
    <v-dialog v-model="dialogMakeTransfer" persistent max-width="600px">
      <v-toolbar color="primary">
        <v-btn icon @click="dialogMakeTransfer = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Make a Transfer from {{ contextWallet.name }}</v-toolbar-title>
      </v-toolbar>
      <make-transfer :wallet="contextWallet" @complete="transferComplete()"/>
    </v-dialog>

    <!-- Remove Wallet Dialog -->
    <v-dialog v-model="dialogRemoveWallet" persistent max-width="600px">
      <v-toolbar color="primary">
        <v-btn icon @click="dialogRemoveWallet = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Are you sure you want to remove the wallet?</v-toolbar-title>
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
  import MakeTransfer from "~/components/MakeTransfer";
  import TestnetButtons from "~/components/TestnetButtons";
  import WalletAdd from "~/components/WalletAdd";

  export default {
    components: {
      MakeTransfer,
      Activation,
      Balance,
      BackupWallet,
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
        return this.$store.state.runtime.environment;
      },
      haveEthereumWallet() {
        return this.$store.state.wallet.haveEthereumWallet
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
      var preparationInterval = setInterval(
        function() {
          clearInterval(preparationInterval);
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
        this.$store.commit("wallet/removeWallet", this.contextWallet);
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
