<template>
  <v-layout column justify-center align-center>
    <v-flex xs12>{{ wallets }}</v-flex>
    <v-flex xs12 sm8 md6>
      <!-- Wallet Management -->
      <v-card>
        <!-- New contact -->
        <!-- <v-dialog v-model="addWalletDialog" persistent max-width="600px">
          <v-btn slot="activator" color="success" absolute fab bottom left>
            <v-icon>add</v-icon>
        </v-btn>-->
        <!-- <v-card> -->
        <v-tabs centered color="cyan" dark icons-and-text>
          <v-tabs-slider color="yellow"/>
          <v-tab href="#aen" @click="walletType = 'aen'">AEN</v-tab>
          <v-tab href="#eth" @click="walletType = 'eth'">ETH</v-tab>

          <!-- AEN -->
          <v-tab-item value="aen">
            <v-card flat>
              <v-form ref="form" v-model="valid" class="full-width" @submit.prevent="onSubmit">
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
              <v-card-text>here ya were</v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="blue darken-1" flat @click.native="addWalletDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="generateWallet">Save</v-btn>
        </v-card-actions>
        <!-- </v-card>
        </v-dialog>-->
        <v-card-title class="headline">Wallet Management</v-card-title>
        <v-card-text>
          <v-list two-line>
            <template v-for="(wallet, address) in wallets">
              <v-list-tile :key="address" avatar ripple @click="toggle(address)">
                <v-list-tile-content>
                  <v-list-tile-title>{{ address }}</v-list-tile-title>
                  <v-list-tile-sub-title class="text--primary">{{ wallet.type }}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <!-- <v-list-tile-action-text>{{ item.action }}</v-list-tile-action-text> -->
                  <!-- <v-icon v-if="selected.indexOf(index) < 0" color="grey lighten-1">star_border</v-icon> -->
                  <!-- <v-icon v-else color="yellow darken-2">star</v-icon> -->
                </v-list-tile-action>
              </v-list-tile>
              <v-divider :key="address"/>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import BackupWallet from "../components/BackupWallet";
import VueRecaptcha from "vue-recaptcha";

export default {
  components: {
    BackupWallet,
    VueRecaptcha
  },
  data() {
    return {
      addWalletDialog: false,
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
      return this.$store.state.wallets;
    },
    currentWallet() {
      return this.$account.$store.state;
    },
    multipleNetworks() {
      if (this.$g("available_networks").length > 1) {
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
    /**
     * Create a new wallet on one of the various networks
     */
    generateWallet() {
      // Make sure that the form being submitted is valid
      if (!this.$refs.form.validate()) {
        return;
      }

      switch (this.walletType) {
        case "aen":
        default:
          console.log("Creating AEN Wallet");
          this.$account.newAencWallet(
            this.$store.state.account.network.identifier,
            this.walletName,
            this.walletPassword
          );
      }
    }
  }
};
</script>
