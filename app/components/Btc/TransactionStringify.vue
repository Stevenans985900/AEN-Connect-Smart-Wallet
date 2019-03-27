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
      address: null
    }
  },
  computed: {
      date() {
        return format(this.transaction.confirmed, 'YYYY-MM-DD HH:mm')
      },
      direction() {
        if(this.transaction.tx_input_n === -1) {
          return 'incoming'
        }
        return 'outgoing'
      },
      symbol() {
        return this.$store.state.wallet.btc.displaySymbol
      }
  },
  mounted() {
    if(this.display === 'all' || this.display === 'address') {
      const networkHandler = this.$store.getters['wallet/networkHandler']('btc')
      networkHandler.transactionInfo({
        hash: this.transaction.tx_hash,
        network: this.wallet.network
      }).then((transactionInformation) => {
        this.address = transactionInformation.addresses[0]
      })
    }
  }
}
</script>
