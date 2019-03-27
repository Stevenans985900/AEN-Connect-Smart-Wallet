<template>
  <v-data-table
    v-if="transactions"
    :headers="headers"
    :items="transactions"
    item-key="signature"
  >
    <!-- :expand="expand" -->
    <template slot="items" slot-scope="props">
      <tr @click="props.expanded = !props.expanded">
        <td>
          <transaction-stringify :wallet="wallet" :transaction="props.item" display="date" />
        </td>
        <td>
          <transaction-stringify :wallet="wallet" :transaction="props.item" display="direction" />
        </td>
        <td>
          <transaction-stringify :wallet="wallet" :transaction="props.item" display="value" />
        </td>
        <td>
          <transaction-stringify :wallet="wallet" :transaction="props.item" display="address" />
        </td>
      </tr>
    </template>
    <!-- <template slot="expand" slot-scope="props">
      <v-card flat>
        <v-card-text>Peek-a-boo!</v-card-text>
      </v-card>
    </template> -->
  </v-data-table>
  <span v-else>
    <h1>No Transactions</h1>
    <img src="/nothing.png" alt="nothing">
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
      expand: false,
      headers: [
        { text: 'Date', sortable: false, value: '' },
        { text: 'Direction', sortable: false, value: '' },
        { text: 'Amount', sortable: false, value: '' },
        { text: 'Address', sortable: false, value: '' }
      ]
    }
  },
  computed: {
    transactions() { return Object.values(this.wallet.transactions) }
  }
}
</script>
