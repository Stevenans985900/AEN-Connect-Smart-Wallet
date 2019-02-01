<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <v-card flat>
        <v-progress-circular v-if="loading === true" indeterminate />
        <span v-else>
          <v-card-text v-if="transactions">
            <transaction-stringify v-for="(transaction,index) in transactions" :key="index" :wallet="wallet" :transaction="transaction" />
          </v-card-text>
          <v-card-text v-else>
            <h1>No Transactions</h1>
            <img src="/nothing.png" alt="nothing">
          </v-card-text>
        </span>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import TransactionStringify from '~/components/Contract/TransactionStringify'

export default {
  components: {
    TransactionStringify
  },
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      options: {},
      transactions: {},
      loading: true
    }
  },
  mounted() {
    this.options = {
      wallet: this.wallet,
      etherscan: this.$g('eth.etherscan')
    }
    const networkHandler = this.$store.getters['wallet/networkHandler']('contract')
    networkHandler.transactionsHistorical(this.options).then((transactions) => {
      this.transactions = transactions
      this.loading = false
    })

    setInterval(
      function () {
        networkHandler.transactionsHistorical(this.options).then((transactions) => {
          this.transactions = transactions
        })
      }.bind(this), this.$g('internal.commonTasksInterval')
    )
  }
}
</script>
