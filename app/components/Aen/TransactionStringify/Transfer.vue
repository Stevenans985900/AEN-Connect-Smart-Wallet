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
      <token-value :symbol="symbol" :value="value" :type="wallet.type" />
    </span>
    <span v-if="display === 'all' || display === 'address'">
      <address-render :address="address" show-add />
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
    address() {
      if (this.direction === 'incoming') {
        return this.data.signer.address.address
      } else {
        return this.data.recipient.address
      }
    },
    date() {
      return format((this.data.deadline.value), 'YYYY-MM-DD HH:mm')
    },
    direction() {
      if (this.data.recipient.address.toLowerCase() === this.wallet.address.toLowerCase()) {
        return 'incoming'
      } else {
        return 'outgoing'
      }
    },
    value() {
      if (!this.data.hasOwnProperty('mosaics')) return 0
      return (this.data.mosaics[0].amount.lower / 1000000)
    }
  }
}
</script>
