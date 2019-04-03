<template>
  <span>
    <span v-if="display === 'all' || display === 'direction'">
      <v-icon v-if="direction === 'incoming'">
        call_received
      </v-icon>
      <v-icon v-else>
        call_made
      </v-icon>
    </span>
    <span v-if="display === 'all' || display === 'date'">
      {{ date }}
    </span>
    <span v-if="display === 'all' || display === 'value'">
      {{ controlledTokens }}
    </span>
    <span v-if="display === 'all' || display === 'title'">
      {{ title }}
    </span>
    <span v-if="display === 'all' || display === 'address'">
      <!--<address-render :address="transaction.contractAddress" show-add />-->
      {{ transaction }}
    </span>
    <span v-if="display === 'all' || display === 'details'">
      <p>You currently control {{ controlledTokens }} tokens</p>
      <p>{{ transactionGas }} TX Gas - {{ operationGas }} Operation Gas</p>
    </span>
  </span>
</template>

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
  data() {
    return {
      networkHandler: null,
      contractDetails: {},
      title: 'Unrecognised Contract'
    }
  },
  computed: {
    date() {
      return format(this.transaction.timeStamp * 1000, 'YYYY-MM-DD HH:mm')
    },
    controlledTokens() {
      if(this.transaction.hasOwnProperty('amount')) {
        return this.transaction.amount + ' ' + this.transaction.symbol
      } else {
        return 0
      }
    },
    direction() {
      if(this.transaction.from.toUpperCase() === this.wallet.address.toUpperCase()) {
        return 'incoming'
      } else {
        return 'outgoing'
      }
    },
    totalGas() {
      return this.transaction.cumulativeGasUsed
    },
    transactionGas() {
      return this.transaction.gasUsed
    },
    operationGas() {
      return this.transaction.cumulativeGasUsed - this.transaction.gasUsed
    }
  }
}
</script>
