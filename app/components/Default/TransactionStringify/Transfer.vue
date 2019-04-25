<template>
  <span>
    <span v-if="display === 'all' || display === 'direction'">
      <v-icon :class="transaction.direction">
        {{ icon }}
      </v-icon>
    </span>
    <span v-if="display === 'all' || display === 'date'">
      {{ date }}
    </span>
    <span v-if="display === 'all' || display === 'value'" :class="transaction.direction">
      <token-value :symbol="symbol" :value="transaction.value" :type="wallet.type" />
    </span>
    <span v-if="display === 'all' || display === 'address'">
      <address-render :address="address" show-add />
    </span>
  </span>
</template>

<style scoped>
  .IN {
    color: #4CAF50
  }
  .OUT {
    color: #F44336
  }
</style>
<script>
    import { format } from 'date-fns'

    export default {
        props: {
            display: {
                type: String,
                default: 'all'
            },
            transaction: {
                type: Object,
                default: function () {
                    return {}
                }
            },
            wallet: {
                type: Object,
                default: function () {
                    return {}
                }
            }
        },
        computed: {
            symbol() { return this.$store.state.wallet[this.wallet.type].displaySymbol },
            icon() { return this.transaction.direction == 'IN' ? 'call_received' : 'call_made' },
            address() {
                if (this.transaction.direction === 'IN') {
                    return this.transaction.sender
                } else {
                    return this.transaction.recipient
                }
            },
            date() {
                const dateFormat = this.$vuetify.breakpoint.mdAndUp === true ? 'YYYY-MM-DD HH:mm' : 'YY-MM-DD HH:mm'
                return format((this.transaction.time), dateFormat)
            }
        }
    }
</script>
