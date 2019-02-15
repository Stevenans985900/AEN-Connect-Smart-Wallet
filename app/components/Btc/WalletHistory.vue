<template>
  <span>
    <v-progress-circular v-if="loading === true" indeterminate />
    <span v-if="transactions && loading === false">
      <v-data-table
        :headers="headers"
        :items="transactions"
        item-key="signature"
      >
        <!-- :expand="expand" -->
        <template slot="items" slot-scope="props">
          <tr @click="props.expanded = !props.expanded">
            <td>
              <transaction-stringify :transaction="props.item" display="date" />
            </td>
            <td>
              <transaction-stringify :wallet="wallet" :transaction="props.item" display="direction" />
            </td>
            <td>
              <transaction-stringify :wallet="wallet" :transaction="props.item" display="value" />
            </td>
          </tr>
        </template>
        <!-- <template slot="expand" slot-scope="props">
          <v-card flat>
            <v-card-text>Peek-a-boo!</v-card-text>
          </v-card>
        </template> -->
      </v-data-table>
    </span>
    <span v-else>
      <h1>No Transactions</h1>
      <img src="/nothing.png" alt="nothing">
    </span>
  </span>
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
      transactionsListener: null,
      transactions: {},
      loading: true,
      expand: false,
      headers: [
        { text: 'Date', sortable: false, value: '' },
        { text: 'Direction', sortable: false, value: '' },
        { text: 'Amount', sortable: false, value: '' }
      ]
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
