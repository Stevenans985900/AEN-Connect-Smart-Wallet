<template>
  <v-layout row wrap>
    <v-card flat>
      <v-progress-circular v-if="loading === true" indeterminate />
      <span v-else>
        <v-card-text v-if="transactions">
          <v-data-table
            :headers="headers"
            :items="transactions"
            item-key="signature"
          >
            <!-- :expand="expand" -->
            <template slot="items" slot-scope="props">
              <tr @click="props.expanded = !props.expanded">
                <td>
                  <transaction-stringify :transaction="props.item" display="date"/>
                </td>
                <td>
                  <transaction-stringify :wallet="wallet" :transaction="props.item" display="direction"/>
                </td>
                <td>
                  <transaction-stringify :wallet="wallet" :transaction="props.item" display="value"/>
                </td>
                <td>
                  <transaction-stringify :wallet="wallet" :transaction="props.item" display="address"/>
                </td>
              </tr>
            </template>
            <!-- <template slot="expand" slot-scope="props">
              <v-card flat>
                <v-card-text>Peek-a-boo!</v-card-text>
              </v-card>
            </template> -->
          </v-data-table>
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
        loading: true,
        expand: false,
        headers: [
          { text: 'Date', sortable: false, value: '' },
          { text: 'Direction', sortable: false, value: '' },
          { text: 'Amount', sortable: false, value: '' },
          { text: 'Address', sortable: false, value: '' }
        ]
      }
    },
    mounted() {
      let networkHelper = new Aen(this.$store.state.wallet.aen.activeApiEndpoint)
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
