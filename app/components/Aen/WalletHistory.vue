<template>
  <v-progress-circular v-if="loading === true" indeterminate />
  <v-data-table
    v-else
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
</template>

<script>
import TransactionStringify from '~/components/Aen/TransactionStringify'

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
      // transactions: {},
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
    computed: {
      transactions() { return Object.values(this.wallet.transactions) }
    },
    mounted() {
      this.$store.dispatch('wallet/transactionsHistorical', this.wallet).then(() => {
          this.loading = false
      })
        this.transactionsListener = setInterval(
          function () {
            this.$store.dispatch('busy', 'wallet.message.updating_history')
              this.$store.dispatch('wallet/transactionsHistorical', this.wallet).then(() => {
                  this.$store.dispatch('busy', false)
              })
          }.bind(this),
          this.$g('internal.commonTasksInterval')
        )

    },
  beforeDestroy() {
    clearInterval(this.transactionsListener)
  }
}
</script>
