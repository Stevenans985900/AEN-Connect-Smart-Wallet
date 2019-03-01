<template>
  <span>
    <span v-if="display === 'all' || display === 'date'">
      {{ date }}
    </span>
    <span v-if="display === 'all' || display === 'direction'">
      <v-icon v-if="direction === 'incoming'" :class="direction">
        call_received
      </v-icon>
      <v-icon v-else :class="direction">
        call_made
      </v-icon>
    </span>
    <span v-if="display === 'all' || display === 'value'" :class="direction">
      <token-value :symbol="symbol" :value="transaction.value" :type="wallet.type" />
    </span>
    <span v-if="display === 'all' || display === 'address'">
      <address-render :address="address" show-add />
    </span>
    <span v-if="display === 'all' || display === 'details'">
      Here be the details
    </span>
  </span>
</template>

<style>
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
// import Web3 from 'web3'

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
  data() {
    return {
      networkHandler: {}
    }
  },
  computed: {
    address() {
      if (!this.transaction.hasOwnProperty('from')) return 'Unknown'
      return this.transaction.from
    },
    color() {
      return (this.direction === 'incoming' ? 'green' : 'red')
    },
    direction() {
      if(this.transaction.hasOwnProperty('to') && this.wallet.hasOwnProperty('address')) {
        if (this.transaction.to.toUpperCase() === this.wallet.address.toUpperCase()) {
          return 'incoming'
        } else {
          return 'outgoing'
        }
      }
      return ''
    },
    date() {
      return format(this.transaction.timeStamp * 1000, 'YYYY-MM-DD HH:mm')
    },
    symbol() { return this.$store.state.wallet.eth.displaySymbol }
  },
  created() {}
}
</script>
