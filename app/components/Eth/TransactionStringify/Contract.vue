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
      {{ totalGas }}
    </span>
    <span v-if="display === 'all' || display === 'title'">
      {{ title }}
    </span>
    <span v-if="display === 'all' || display === 'address'">
      <address-render :address="transaction.contractAddress" show-add />
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
      title: 'Unrecognised Contract',
      controlledTokens: 0
    }
  },
  computed: {
    date() {
      return format(this.transaction.timeStamp * 1000, 'YYYY-MM-DD HH:mm')
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
  watch: {
    transaction: {
      handler: function () {
        this.fetchContractInfo()
      },
      deep: true
    }
  },
  mounted() {
    this.fetchContractInfo()
  },
  methods: {
    fetchContractInfo() {
      const networkHandler = this.$store.getters['wallet/networkHandler']('contract')
      console.log('fetching transaction info for contract')
      console.log(this.transaction)
      networkHandler
        .balance({
          managerWalletAddress: this.wallet.address,
          address: this.transaction.contractAddress
        })
        .then((response) => {
          this.controlledTokens = response
        })
        .catch(function () {
          console.log('caught bad return from balance')
        })

      networkHandler
          .erc20PublicMethod({
            contractAddress: this.transaction.contractAddress,
            method: 'name'
          })
          .then((contractName) => {
            this.title = contractName
          })
          .catch(function () {
              console.debug('This contract does not really exist...')
            })

    }
  }
}
</script>
