<template>
  <v-layout column justify-center align-center>
    <h1>
      This wallet is not yet online
    </h1>
    <p>
      If you have already made a transfer, it is possible the network has not yet processed it. The app will periodically
      check network status and this message will disappear once verified. If you would like to manually check, click the button below
    </p>
    <v-alert :value="true" color="info">
      <wallet-check-on-chain v-if="wallet.onChain === false" :wallet="wallet" />
    </v-alert>
    <p>
      If you are still getting the message even after being sure a transfer has taken place, please try using the help
      feature by clicking the question mark in the top right corner to help diagnose the problem.
    </p>
  </v-layout>
</template>

<script>
import WalletCheckOnChain from '~/components/WalletCheckOnChain'

export default {
  components: { WalletCheckOnChain },
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  }
}
</script>
