<template>
  <v-progress-circular v-if="loading === true" indeterminate :size="25" />
  <v-btn v-else outline small icon @click="refresh($event)">
    <v-icon>
      loop
    </v-icon>
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
      data() {
        return {
            loading: false
        }
      },
      computed:
      {
        lastSynced() {
            if(this.wallet.balanceLastSynced === false) {
                return this.$t('common.label.never')
            } else {
                return format(this.wallet.balanceLastSynced, 'D/M HH:mm')
            }
        }
      },
      methods: {
          async refresh(event) {
              event.stopPropagation()
              this.loading = true
              if(this.wallet.onChain) {
                  this.$store.commit('CACHE_SKIP', true)
                  this.$store.dispatch('wallet/transactionsHistorical', this.wallet)
                  this.$store.commit('CACHE_SKIP', true)
                  await this.$store.dispatch('wallet/balance', this.wallet)
                  this.loading = false
              } else {
                  const response = await this.$store.dispatch('wallet/getLiveWallet', this.wallet)
                  if (response !== false) {
                    // Just in case wallet has already been updated, save commit
                    if(this.wallet.onChain === false) {
                      this.$store.commit('wallet/setWalletProperty', {
                        address: this.wallet.address,
                        key: 'onChain',
                        value: true
                      })
                    }
                    await this.$store.dispatch('wallet/balance', this.wallet)
                  }
                  this.loading = false
              }

        }
      }
  }
</script>
