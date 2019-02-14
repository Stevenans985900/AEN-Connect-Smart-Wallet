<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <v-btn @click="getMore">
        Get more xfer
      </v-btn>
    </v-flex>
    <v-flex xs12>
      <v-card flat>
        <v-progress-circular v-if="loading === true" indeterminate />
        <span v-else>
          {{ transactions }}
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
import TransactionStringify from '~/components/Btc/TransactionStringify'

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
    this.$store.dispatch('wallet/transactionsHistorical', this.wallet).then((wallet) => {
      this.transactions = wallet.transactions
      this.loading = false
    })
  },
  methods: {
    getMore() {
      this.$store.dispatch('wallet/transactionsHistorical', this.wallet).then((wallet) => {
      this.transactions = wallet.transactions
      this.loading = false
    })
    }
  }

}
</script>
