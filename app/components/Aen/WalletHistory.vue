<template>
  <v-data-table
    v-if="$vuetify.breakpoint.mdAndUp"
    :headers="headers"
    :expand="expand"
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
    <template slot="expand" slot-scope="props">
      <v-card flat>
        <v-card-text>
          Peek-a-boo!
          {{ props }}
        </v-card-text>
      </v-card>
    </template>
  </v-data-table>
  <v-list v-else two-line>
    <template v-for="(transaction, index) in paginatedTransactions">
      <v-list-tile
              :key="index"
              avatar
      >
        <v-list-tile-content>
          <v-list-tile-title>
            <v-layout row>
              <v-flex xs6>
                <transaction-stringify :wallet="wallet" :transaction="transaction" display="date" />
              </v-flex>
              <v-flex xs6 class="text-xs-right">
                <transaction-stringify :wallet="wallet" :transaction="transaction" display="value" />
              </v-flex>
            </v-layout>
          </v-list-tile-title>
          <v-list-tile-sub-title>
            <v-layout row align-center>
              <v-flex xs10>
                <transaction-stringify :wallet="wallet" :transaction="transaction" display="address" />
              </v-flex>
              <v-flex xs2>
                <v-btn icon @click="transactionInfo(transaction)">
                  <v-icon>
                    info
                  </v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </template>
    <v-dialog v-model="dialogTransactionInfo" v-if="contextTransaction">
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
          <p v-if="contextTransaction.hash" class="text-truncate">
            Hash: <clipboard :data="contextTransaction.hash" :wide="$vuetify.breakpoint.smAndDown" />
          </p>
          <p v-if="contextTransaction.blockIncluded" class="text-truncate">
            Block Included: {{ contextTransaction.blockIncluded }}
          </p>
          <p v-if="contextTransaction.fee" class="text-truncate">
            Fee: <token-value :symbol="symbol" :value="contextTransaction.value" :type="wallet.type" />
          </p>
          <p v-if="contextTransaction.message" class="text-truncate">
            <br>Message: {{ contextTransaction.message }}
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-list>
</template>

<script>
    import Clipboard from '~/components/Clipboard'
import TransactionStringify from '~/components/Aen/TransactionStringify'

export default {
  components: {
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
      numberPerPage: 5,
      page: 1,
      loading: true,
      expand: false,
      headers: [
        { text: 'Date', sortable: false, value: '' },
        { text: 'Direction', sortable: false, value: '' },
        { text: 'Amount', sortable: false, value: 'value' },
        { text: 'Address', sortable: false, value: '' }
      ]
    }
  },
    computed: {
      symbol() { return this.$store.state.wallet.aen.displaySymbol },
      paginatedTransactions() {
          if(this.page === 1) {
              return this.transactions.slice(0, (this.numberPerPage - 1))
          } else {
              return this.transactions.slice(
                  (this.numberPerPage * this.page - 1),
                  (this.numberPerPage * this.page + (this.numberPerPage - 1))
              )
          }
      },
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
