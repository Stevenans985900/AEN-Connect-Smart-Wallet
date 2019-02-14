<template>
  <v-layout column justify-center align-center>
    <h1>
      This wallet is not yet online
    </h1>
    <p>
      If you have already made a transfer, it is possible the network has not yet detected it. This app will periodically
      check in but, if you would like to manually try, click the button below
    </p>
    <v-btn @click="getLiveWallet(wallet)">
      Check
    </v-btn>
    <p>
      If you are still getting the message even after being sure a transfer has taken place, please try using the help
      feature by clicking the question mark in the top right corner to help diagnose the problem.
    </p>
  </v-layout>
</template>

<script>

export default {
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  created: function () {},
  methods: {
    getLiveWallet(wallet) {

      this.$store.dispatch('wallet/getLiveWallet', wallet).then((response) => {
        if(response !== false) {
          this.$store.commit('wallet/setWalletProperty', {
            address: this.wallet.address,
            key: 'onChain',
            value: true
          })
          this.$store.commit('showNotification', {
            type: 'success',
            message: 'The wallet is recognised on the blockchain'
          })
        } else {
          this.$store.commit('showNotification', {
            type: 'info',
            message: 'The wallet is not yet recognised on the blockchain'
          })
        }
      })
    }
  }
}
</script>
