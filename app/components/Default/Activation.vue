<template>
  <v-layout column justify-center align-center>
    <h1>
      {{ $t('activation.message.wallet_offline') }}
    </h1>
    <p>{{ $t('activation.message.initial_guidance') }}</p>
    <p>{{ $t('activation.message.troubleshooting_guidance') }}</p>
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
  }
}
</script>
