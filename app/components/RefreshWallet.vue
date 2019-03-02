<template>
  <v-btn outline icon small @click="refreshHistory">
    <v-icon>
      loop
    </v-icon>
  </v-btn>
</template>
<script>
  export default {
      props: {
          wallet: {
              type: Object,
              default: null
          }
      },
      methods: {
          refreshHistory() {
              this.$store.commit('CACHE_SKIP', true)
              this.$store.dispatch('wallet/transactionsHistorical', this.wallet)
              this.$store.commit('CACHE_SKIP', true)
              this.$store.dispatch('wallet/balance', this.wallet)
          }
      }
  }
</script>
