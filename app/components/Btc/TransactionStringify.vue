<template>
  <span>
    <span v-if="display === 'all' || display === 'direction'">
      <v-icon v-if="direction === 'incoming'" :class="direction">
        call_received
      </v-icon>
      <v-icon v-else :class="direction">
        call_made
      </v-icon>
    </span>
    <span v-if="display === 'all' || display === 'date'">
      {{ date }}
    </span>
    <span v-if="display === 'all' || display === 'value'" :class="direction">
      <token-value :symbol="symbol" :value="transaction.value" :type="wallet.type" />
    </span>
  </span>
</template>

<style scoped>
  .incoming {
    color: #4CAF50
  }
  .outgoing {
    color: #F44336
  }
</style>

<script>
import { format } from 'date-fns'
import TokenValue from '~/components/TokenValue'
export default {
  components: { TokenValue },
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
    date() {
      return format(this.transaction.confirmed, 'YYYY-MM-DD HH:mm')
    },
    direction() {
      if(this.transaction.spent === false) {
        return 'incoming'
      }
      return 'outgoing'
    },
    symbol() {
      return this.$store.state.wallet.btc.displaySymbol
    }
  }
}
</script>
