<template>
  <span>
    <v-data-table
      v-if="$vuetify.breakpoint.mdAndUp"
      :headers="headers"
      :expand="expand"
      :items="transactions"
      :must-sort="true"
      :pagination.sync="paginationOptions"
      item-key="txHash"
    >
      <!-- :expand="expand" -->
      <template slot="items" slot-scope="props">
        <tr @click="props.expanded = !props.expanded">
          <td>{{ props.item.time }}</td>
          <td>
            <transaction-stringify :wallet="wallet" :transaction="props.item" display="direction" />
          </td>
          <td>
            <transaction-stringify :wallet="wallet" :transaction="props.item" display="value" />
          </td>
          <td>
            <transaction-stringify :wallet="wallet" :transaction="props.item" display="address" />
          </td>
          <td>
            <v-btn icon @click="transactionInfo(props.item)">
              <v-icon>
                info
              </v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
      <template slot="expand" slot-scope="props">
        <v-card flat>
          <v-card-text>
            Peek-a-boo!
            {{ props }}
          </v-card-text>
        </v-card>
      </template>
    </v-data-table>
    <v-data-iterator
      v-else
      :items="transactions"
      :must-sort="true"
      :pagination.sync="paginationOptions"
      :rows-per-page-items="[4,8,12]"
      content-tag="v-layout"
      row
      wrap
    >
      <template v-slot:item="props">
        <v-flex xs12>
          <v-layout row wrap>
            <v-flex xs6>
              <transaction-stringify :wallet="wallet" :transaction="props.item" display="date" />
            </v-flex>
            <v-flex xs6 class="text-xs-right">
              <transaction-stringify :wallet="wallet" :transaction="props.item" display="value" />
            </v-flex>
            <v-flex xs10>
              <transaction-stringify :wallet="wallet" :transaction="props.item" display="address" />
            </v-flex>
            <v-flex xs2>
              <v-btn icon @click="transactionInfo(props.item)">
                <v-icon>
                  info
                </v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-flex>
      </template>
    </v-data-iterator>
    <v-dialog v-model="dialogTransactionInfo" v-if="contextTransaction" max-width="400px">
      <v-toolbar>
        <v-toolbar-title>
          Transaction Info
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="dialogTransactionInfo = false">
          <v-icon>
            close
          </v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <v-btn block class="info" @click="goToExplorer">
            Go to explorer
          </v-btn>
          <p v-if="contextTransaction.txHash" class="text-truncate">
            Hash: <clipboard :data="contextTransaction.txHash" :wide="$vuetify.breakpoint.smAndDown" />
          </p>
          <p v-if="contextTransaction.blockIncluded">
            Block Included: {{ contextTransaction.blockIncluded }}
          </p>
          <p v-if="contextTransaction.fee">
            Fee: <token-value :symbol="symbol" :value="contextTransaction.fee" :type="wallet.type" />
          </p>
          <p v-if="contextTransaction.message">
            Message: {{ contextTransaction.message }}
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
    import Clipboard from '~/components/Clipboard'
import TransactionStringify from '~/components/Aen/TransactionStringify'
    import TokenValue from "../TokenValue";

export default {
  components: {
      TokenValue,
    Clipboard,
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
      dialogTransactionInfo: false,
      contextTransaction: null,
      numberPerPage: 3,
      page: 1,
      loading: true,
      expand: false,
      headers: [
        { text: 'Date', value: 'time' },
        { text: 'Direction', sortable: false, value: 'direction' },
        { text: 'Amount', sortable: false, value: 'value' },
        { text: 'Address', sortable: false, value: '' },
        { text: 'Info', sortable: false, value: ''}
      ],
      paginationOptions: {
        page: 1,
        sortBy: 'time',
        descending: true
      }
    }
  },
    computed: {
      symbol() { return this.$store.state.wallet.aen.displaySymbol },
      lastIndex() { return this.paginatedTransactions.length -1 },
      paginatedTransactions() {
          const startIndex = ((this.numberTransactions - 1) - (this.page * this.numberPerPage))
          const endIndex = ((this.numberTransactions - 1) - (this.page * this.numberPerPage + this.numberPerPage))
          this.$log.debug('paginated transactions', this.transactions, startIndex, endIndex)
          return this.transactions.slice(startIndex, endIndex).reverse()


          // console.log('HERE')
          // console.log(this.transactions)
          // if(this.page === 1) {
          //     console.log('is page 1')
          //     return (this.transactions.slice(0, (this.numberPerPage)))
          // } else {
          //     return this.transactions.slice(
          //         (this.numberPerPage * this.page - 1),
          //         (this.numberPerPage * this.page + (this.numberPerPage - 1))
          //     ).reverse()
          // }
      },
      numberTransactions() { return this.transactions.length },
      transactions() { return Object.values(this.wallet.transactions) }
    },
    mounted() {
      this.$store.dispatch('wallet/transactionsHistorical', this.wallet).then(() => {
          this.loading = false
      })
    },
    methods: {
      goToExplorer() {
        window.open(this.$g('aen.transaction_explorer') + this.contextTransaction.hash)
      },
      transactionInfo(transaction) {
          this.contextTransaction = transaction
          this.dialogTransactionInfo = true
      }
    }
}
</script>
