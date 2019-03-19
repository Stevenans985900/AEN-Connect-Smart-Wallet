<template>
  <v-btn v-if="wallet.onChain === true" outline small @click="refresh">
    <v-icon>
      loop
    </v-icon>
    {{ $t('common.label.synced') }} {{ lastSynced }}
  </v-btn>
  <wallet-check-on-chain v-else :wallet="wallet" />
</template>
<script>
  import WalletCheckOnChain from "~/components/WalletCheckOnChain"

  import { format } from 'date-fns'
  export default {
      components: { WalletCheckOnChain },
      props: {
          wallet: {
              type: Object,
              default: null
          }
      },
      computed:
      {
        lastSynced() {
            if(this.wallet.balanceLastSynced === false) {
                return this.$t('common.label.never')
            } else {
                return format(this.wallet.balanceLastSynced, 'Do MMM HH:mm')
            }
        }
      },
      methods: {
          refresh() {
            this.$store.commit('CACHE_SKIP', true)
            this.$store.dispatch('wallet/transactionsHistorical', this.wallet).then(() => {
                this.$store.commit('CACHE_SKIP', true)
                this.$store.dispatch('wallet/balance', this.wallet)
            })

        }
      }
  }
</script>
