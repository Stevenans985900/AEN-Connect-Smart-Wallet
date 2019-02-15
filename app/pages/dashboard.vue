<template>
  <v-layout row justify-center align-center>
    <v-flex xs-12>
      <graph-balance-spread />
    </v-flex>
  </v-layout>
</template>

<script>
import GraphBalanceSpread from '../components/GraphBalanceSpread'

export default {
  /**
   * COMPONENTS
   */
  components: {
    GraphBalanceSpread
  },
  head() {
    return {
      title: 'AENConnect Smart Wallet - Dashboard',
      meta: [
        { hid: 'description', name: 'description', content: 'Review your wallets and get details of the latest ICOs' }
      ]
    }
  },
  /**
   * MOUNTED
   */
  mounted: function () {
    console.debug('Dashboard Page: Started')
    // Only start once global loading finished
    const preparationInterval = setInterval(
      function () {
        if (this.$store.getters.booting === false) {
          clearInterval(preparationInterval)
          this.$store.commit('setLoading', { t: 'router', v: false })
        }
      }.bind(this),
      this.$g('internal.controllerPollReadyInterval')
    )
  }
}
</script>
