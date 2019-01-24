<template>
  <v-layout row justify-center align-center>
    <v-flex xs-12>
      <graph-balance-spread/>
    </v-flex>

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
