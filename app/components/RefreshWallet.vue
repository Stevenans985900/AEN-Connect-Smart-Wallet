<template>
  <v-btn outline small @click="refreshHistory">
    <v-icon>
      loop
    </v-icon>
    Synced {{ lastSynced }}
  </v-btn>
</template>
<script>
  import { format } from 'date-fns'
  export default {
      props: {
          wallet: {
              type: Object,
              default: null
          }
      },
      computed:
      {
        lastSynced() { return format(this.wallet.balanceLastSynced, 'Do MMM HH:mm') }
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
