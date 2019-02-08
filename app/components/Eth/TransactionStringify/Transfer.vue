<template>
  <span>
    <span v-if="display === 'all' || display === 'direction'">
      <v-icon v-if="direction === 'incoming'" color="green">
        call_received
      </v-icon>
      <v-icon v-else color="red">
        call_made
      </v-icon>
    </span>
    <span v-if="display === 'all' || display === 'date'" :class="direction">
      {{ date }}
    </span>
    <span v-if="display === 'all' || display === 'value'" :class="direction">
      {{ value }}
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
// import Web3 from 'web3'

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
    direction() {
      if(this.transaction.from.toUpperCase() === this.wallet.address.toUpperCase()) {
        return 'incoming'
      } else {
        return 'outgoing'
      }
    },
    date() {
      return format(this.transaction.timeStamp * 1000, 'YYYY-MM-DD HH:mm')
    },
    value() {
      console.log(this.transaction)
      if (!this.transaction.hasOwnProperty('value')) return ''
      return this.transaction.value
    }
  },
  created() {}
}
</script>
