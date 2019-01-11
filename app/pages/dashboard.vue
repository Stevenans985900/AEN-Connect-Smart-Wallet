<template>
  <v-layout column justify-center align-center>
    <v-container fluid grid-list-md>
      <v-layout row wrap>
        <!-- ADDRESS SUMMARY -->
        <v-flex v-if="contextWallet.address" xs12>
          <h1>{{ contextWallet.address }}</h1>
        </v-flex>
      </v-layout>

      <v-layout row wrap>
        <!-- ACCOUNT OVERVIEW -->
        <v-flex v-if="contextWallet.onChain === false" xs12>
          <v-alert :value="true" type="info">
            Your wallet is only local. In order to have a network presence, please add some
            coins to it.
          </v-alert>
          <!--<graph-balance-spread/>-->
        </v-flex>
      </v-layout>

      <v-layout>
        <!-- FAUCET -->
        <v-flex v-if="faucets.length" x12 sm6>
          <v-card>
            <v-img src="/faucet.png"/>

            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0">Visit Faucet</h3>
                <div>If you need some coins to get started with the network.</div>
                <v-btn
                  v-for="(faucet) in faucets"
                  :key="faucet.address"
                  :href="faucet.address"
                  target="_blank"
                >Visit: {{ faucet.name }}</v-btn>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>

        <!-- TRANSFERS -->
        <v-flex xs12 sm6>
          <v-card next to="ledger">
            <v-img src="/ledger.png"/>

            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0">Buy / Sell Coin</h3>
                <div>Top up your coins and check the latest prices</div>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-dialog v-model="dialogEulaAgree" persistent max-width="600px">
      <v-card>
        <v-checkbox v-model="eulaAgree">
          <span slot="label">
            I agree to the
            <a href="http://aencoin.com/eula">AEN EULA</a>
          </span>
        </v-checkbox>
      </v-card>
    </v-dialog>

  </v-layout>
</template>

<script>
import GraphBalanceSpread from "../components/GraphBalanceSpread";

export default {
  components: {
    GraphBalanceSpread
  },
  computed: {
    dialogEulaAgree() {
      return !this.eulaAgree
    },
    eulaAgree: {
      get: function() { return this.$store.state.meta.eulaAgree },
      set: function(val) { this.$store.commit('setMeta', {key: 'eulaAgree', value: val}) }
    },
    faucets() {
      return this.$g("aen.faucets");
    },
    contextWallet() {
      return this.$store.state.wallet.context;
    },
    networkIdentifier() {
      return this.$store.state.networkIdentifier;
    }
  },
  created: function() {

    // Only start once global loading finished
    var preperationInterval = setInterval(
      function() {
        if (this.$store.getters.booting === false) {
          clearInterval(preperationInterval);
          this.$store.commit("setLoading", { t: "router", v: false });
        }
      }.bind(this),
      2000
    );
  }
};
</script>
