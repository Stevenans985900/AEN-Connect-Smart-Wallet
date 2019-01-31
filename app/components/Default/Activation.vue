<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6 class="text-xs-center">
      <v-card>
        <v-card-title>This wallet is not yet online</v-card-title>
        <v-card-text>
          <p>
            If you have already made a transfer, it is possible the network has not yet detected it. This app will periodically
            check in but, if you would like to manually try, click the button below
          </p>
          <v-btn @click="checkWalletLive(wallet)">
            Check
          </v-btn>
        </v-card-text>
      </v-card>
      <h1>This wallet is not yet online</h1>
      <img src="/nothing.png" alt="nothing">

      <p>
        If you are still getting the message even after being sure a transfer has taken place, please get in contact with us at <a href="mailto:support@aencoin.io">
          support@aencoin.io
        </a>!
      </p>
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
  created: function () {},
  methods: {
    checkWalletLive(wallet) {
      this.$store.dispatch('wallet/checkWalletLive', wallet).then((response) => {
        console.log('response from checking whether the wallet is live or not')
        console.log(response)
        if (response === true) {
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
