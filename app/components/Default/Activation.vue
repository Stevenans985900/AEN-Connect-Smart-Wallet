<template>
  <v-layout column justify-center align-center>
    <h1>
      {{ $t('activation.message.wallet_offline') }}
    </h1>
    <p>{{ $t('activation.message.initial_guidance') }}</p>
    <v-alert :value="true" color="info">
      <wallet-check-on-chain v-if="wallet.onChain === false" :wallet="wallet" />
    </v-alert>
    <p>{{ $t('activation.message.troubleshooting_guidance') }}</p>
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
