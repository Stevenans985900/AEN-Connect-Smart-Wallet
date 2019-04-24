<template>
  <span>
    <span v-if="display === 'all' || display === 'direction'">
      <v-icon :class="data.direction">
        {{ icon }}
      </v-icon>
    </span>
    <span v-if="display === 'all' || display === 'date'">
      {{ date }}
    </span>
    <span v-if="display === 'all' || display === 'value'" :class="data.direction">
      <token-value :symbol="symbol" :value="data.value" :type="wallet.type" />
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
import TokenValue from '~/components/TokenValue'

export default {
  components: { TokenValue },
  props: {
    display: {
      type: String,
      default: 'all'
    },
    data: {
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
    symbol() { return this.$store.state.wallet.aen.displaySymbol },
    icon() { return this.data.direction == 'IN' ? 'call_received' : 'call_made' },
    address() {
      if (this.data.direction === 'IN') {
        return this.data.sender
      } else {
        return this.data.recipient
      }
    },
    date() {
      const dateFormat = this.$vuetify.breakpoint.mdAndUp === true ? 'YYYY-MM-DD HH:mm' : 'YY-MM-DD HH:mm'
      return format((this.data.time), dateFormat)
    }
  }
}
</script>
