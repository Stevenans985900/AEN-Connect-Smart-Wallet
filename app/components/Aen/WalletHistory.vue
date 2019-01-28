<template>
  <v-layout row wrap>
    <v-card flat>
      <v-progress-circular v-if="loading === true" indeterminate />
      <span v-else>
        <v-card-text v-if="transactions">
          <v-expansion-panel>
            <v-expansion-panel-content
              v-for="(transaction,index) in transactions"
              :key="index"
            >
              <div slot="header">
                <transaction-stringify :wallet="wallet" :transaction="transaction"/>
              </div>
              <v-card>
                <v-card-text>
                  <hr>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card-text>
        <v-card-text v-else>
          <h1>No Transactions</h1>
          <img src="/nothing.png" alt="nothing">
        </v-card-text>
      </span>
    </v-card>
  </v-layout>
</template>

<script>
import TransactionStringify from '~/components/Aen/TransactionStringify'
import Aen from '~/class/network/Aen'

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
        transactions: {},
        loading: true
      }
    },
    mounted() {
      let networkHelper = new Aen(this.$store.state.wallet.internal.activeApiEndpoint)
      networkHelper.transactionsHistorical(this.wallet).then(transactions => {
        this.transactions = transactions
        this.loading = false
      })

      setInterval(
        function() {
          networkHelper.transactionsHistorical(this.wallet).then(transactions => {
            this.transactions = transactions
          })
        }.bind(this), 15000
      )

    }
}
</script>
