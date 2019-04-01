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
  },
  mounted() {
    // Check whether a wallet record exists for handling the contract
    if(!this.$store.state.wallet.wallets.hasOwnProperty(this.transaction.contractAddress)) {
      let walletOptions = {
        type: 'contract',
        address: this.transaction.contractAddress,
        network: this.wallet.network,
        managerWalletAddress: this.wallet.address,
        contractName: this.transaction.contractName,
        decimals: this.transaction.decimals,
        symbol: this.transaction.symbol
      }
      this.$store.dispatch('wallet/load', walletOptions)
        .then((wallet) => {
          this.$store.commit('showNotification', {
            type: 'success',
            message: this.$t('wallet.message.contract_added' + ': ' + wallet.name)
          })
        })
    }
  }
}
</script>
