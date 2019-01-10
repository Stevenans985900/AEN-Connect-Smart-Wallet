<template>
  <v-layout row wrap>
    <h1>showing AEN account history</h1>
    <!-- Current / Historical transactions -->
    <v-flex xs12>
      <v-card flat>

        <v-card-text v-if="transactions">

          <v-expansion-panel>
            <v-expansion-panel-content
              v-for="(transaction,index) in transactions"
              :key="index"
            >
              <div slot="header">
                <transaction-stringify :transaction="transaction"/>

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
          No Transactions
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import TransactionStringify from '~/components/Aen/TransactionStringify'
import Aen from '~/modules/network/Aen'

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
        transactions: {}
      }
    },
    mounted() {
      let networkHelper = new Aen(this.$store.state.wallet.internal.activeApiEndpoint)
      networkHelper.transactionsHistorical(this.wallet).then(transactions => {
        this.transactions = transactions
      })
    }
}
</script>
