<template>
  <span>
    <span v-if="display === 'all' || display === 'direction'" >
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
      {{ value }}XEM
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
export default {
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
      if (this.data.recipient.address === this.wallet.address) {
        return 'incoming'
      } else {
        return 'outgoing'
      }
    },
    value() {
      if (!this.data.hasOwnProperty('mosaics')) return 0
      const mosaicCount = this.data.mosaics.length
      for (let currentRound = 0; mosaicCount > currentRound; currentRound++) {
        const value = this.data.mosaics[currentRound].amount.lower / 1000000
        const b = value.toFixed(6).split('.')
        const r = b[0].split(/(?=(?:...)*$)/).join(',')
        return r
      }
      return 0
    }
  }
}
</script>
