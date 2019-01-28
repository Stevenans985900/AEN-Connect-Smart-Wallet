<template>
  <v-layout row justify-center align-center>
    <v-flex xs-12>
      <graph-balance-spread/>
    </v-flex>

    <!-- Force the user to agree to the End User license agreement before being able to use the wallet -->
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
  /**
   * COMPONENTS
   */
  components: {
    GraphBalanceSpread
  },
  /**
   * COMPUTED
   */
  computed: {
    dialogEulaAgree() {
      return !this.eulaAgree
    },
    eulaAgree: {
      get: function() { return this.$store.state.user.eulaAgree },
      set: function(val) { this.$store.commit('setUserProperty', {
        key: 'eulaAgree',
        value: val
      }) }
    }
  },
  /**
   * MOUNTED
   */
  mounted: function() {
    console.debug("Dashboard Page: Started")
    // Only start once global loading finished
    let preparationInterval = setInterval(
      function() {
        if (this.$store.getters.booting === false) {
          clearInterval(preparationInterval);
          this.$store.commit("setLoading", { t: "router", v: false });
        }
      }.bind(this),
      this.$g('internal.controllerPollReadyInterval')
    );
  }
};
</script>
