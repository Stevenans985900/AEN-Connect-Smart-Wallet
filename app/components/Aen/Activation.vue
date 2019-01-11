<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6 class="text-xs-center">
      <h1>This wallet is not yet active</h1>
      <img src="/nothing.png" alt="nothing">
      <v-btn @click="checkWalletLive(wallet)">If you have already made a transfer, it is possible the network has not yet detected it. To manually check click here</v-btn>
      <p>If you are still getting the message even after being sure a transfer has taken place, please get in contact with us at <a href="mailto:support@aencoin.io">support@aencoin.io</a>!</p>

    </v-flex>
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
    created: function() {
      console.log('created the AEN activation instructions')
    },
    methods: {
      checkWalletLive(wallet) {
        this.$store.dispatch('wallet/checkWalletLive', wallet).then(response => {
          this.$store.commit('wallet/setProperty', {
            address: wallet.address,
            key: 'onChain',
            value: response
          })
          if (response === true) {
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
      }
    }
}
</script>
