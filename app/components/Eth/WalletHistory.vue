<template>
  <span>
    <span>
      <v-data-table
        :headers="headers"
        :items="transactions"
        item-key="signature"
      >
        <template slot="items" slot-scope="props">
          <tr @click="props.expanded = !props.expanded">
            <td>
              <transaction-stringify
                :wallet="wallet"
                :transaction="props.item"
                display="date"
              />
            </td>
            <td>
              <transaction-stringify
                :wallet="wallet"
                :transaction="props.item"
                display="direction"
              />
            </td>
            <td>
              <transaction-stringify
                :wallet="wallet"
                :transaction="props.item"
                display="value"
              />
            </td>
            <td>
              <transaction-stringify
                :wallet="wallet"
                :transaction="props.item"
                display="address"
              />
            </td>
          </tr>
        </template>
      </v-data-table>
    </span>
  </span>
</template>

<script>
import TransactionStringify from '~/components/Eth/TransactionStringify'

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
      options: {},
      // transactions: {},
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
        transactions() {
            return Object.values(this.wallet.transactions)
        }
    }
}
</script>
