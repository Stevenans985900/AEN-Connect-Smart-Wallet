<template>
  <v-card v-if="haveTrackedTransactions" flat>
    <v-card-title>
      {{ $t('network.label.pending_transactions') }}
      <v-btn icon @click="processTrackedTransactions">
        yo
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-layout v-for="(transaction, txHash) in trackedTransactions" :key="txHash" row wrap>
        <v-flex xs2 sm1>
          <v-icon>
            {{ icon(transaction) }}
          </v-icon>
        </v-flex>
        <v-flex xs8 sm10>
          <a target="_blank" :href="blockExplorerLink(transaction)">
            {{ transaction.address }}<br>
            <span class="caption">
              <token-value :value="transaction.amount" :type="transaction.type" />
            </span>
          </a>
        </v-flex>
        <v-flex xs2 sm1>
          <v-btn icon @click="remove(transaction)">
            <v-icon>
              close
            </v-icon>
          </v-btn>
        </v-flex>
        <v-flex xs12>
          <v-divider />
        </v-flex>
      </v-layout>
    </v-card-text>
  </v-card>
</template>
<script>
  import TokenValue from '~/components/TokenValue'
  export default {
    components: { TokenValue },
    props: {
      wallet: {
        type: Object,
        default: null
      }
    },
    data() {
      return {
        aenWallets: null,
        menuPendingTransactions: false
      }
    },
    computed: {
      haveTrackedTransactions() { return Object.keys(this.trackedTransactions).length > 0 ? true : false },
      trackedTransactions() {
        if(this.wallet !== null) {
          console.log(this.$store.getters['wallet/trackedTransactionsByWallet'](this.wallet))
           return Object.values(this.$store.getters['wallet/trackedTransactionsByWallet'](this.wallet)).filter((transaction) => {
             return transaction.status !== 'complete'
           })
        } else {
          console.log(this.$store.state.wallet.trackedTransactions)
          return Object.values(this.$store.state.wallet.trackedTransactions).filter(transaction => {
            return transaction.status !== 'complete'
          })
        }
      }
    },
    mounted: function () {
      this.$log.debug('Dashboard Startup')
      // Only start once global loading finished
      this.interval = setInterval(
        function () {
          this.aenWallets = this.$store.getters['wallet/networkHandler']('aen')
          this.processTrackedTransactions()
        }.bind(this),
        this.$store.state.time_definitions.transaction_watch
      )
    },
    beforeDestroy() {
      clearInterval(this.interval)
    },
    methods: {
      blockExplorerLink(transaction) {
        switch (transaction.type) {
          case 'aen':
            return ''
          case 'btc':
            return 'https://live.blockcypher.com/btc-testnet/tx/'+transaction.transactionHash+'/'
          case 'eth':
            return 'https://'+transaction.network+'.etherscan.io/address/' + transaction.transactionHash
        }
      },

      /**
       * PROCESS TRACKED TRANSACTIONS
       */
      processTrackedTransactions() {
        let transaction, txHash
        if(this.haveTrackedTransactions === true) {
          this.$log.debug('processing tracked transactions')
          for(txHash in this.trackedTransactions) {
            transaction = this.trackedTransactions[txHash]
            this.$store.dispatch('wallet/transactionStatus', transaction).then((processedTransaction) => {
              this.$log.debug('Transactions status returned', transaction, processedTransaction)

            })
          }
        }
      },
      remove(transaction) {
        console.log('would stop tracking the following transaction if not for debug', transaction)
        this.$store.commit('wallet/TRANSACTION_REMOVE', transaction.txHash)
      },
      icon(transaction) {
        if(transaction.direction === 'outgoing') {
          return 'call_made'
        }
        return 'call_received'
      }
    }
  }
</script>