<template>
  <v-card v-if="haveTrackedTransactions" flat>
    <v-card-title>{{ $t('network.label.pending_transactions') }}</v-card-title>
    <v-card-text>
      <v-layout v-for="transaction in trackedTransactions" :key="transaction.key" row wrap>
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
          <v-btn icon @click="stopTracking(transaction)">
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
        menuPendingTransactions: false
      }
    },
    computed: {
      haveTrackedTransactions() { return Object.keys(this.trackedTransactions).length > 0 ? true : false },
      trackedTransactions() {
        if(this.wallet !== null) {
           return this.$store.getters['wallet/trackedTransactionsByWallet'](this.wallet)
        } else {
          return this.$store.state.wallet.trackedTransactions
        }
      }
    },
    mounted() {
      setInterval(() => { this.processTrackedTransactions() }, this.$g('time_definitions.transaction_watch'))
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
      processTrackedTransactions() {
        if(this.haveTrackedTransactions === true) {
          this.$log.debug('processing tracked transactions')
          for(let transactionHash in this.trackedTransactions) {
            this.$store.dispatch('wallet/transactionStatus', this.trackedTransactions[transactionHash]).then((transaction) => {
              this.$log.debug('Transactions status returned', this.trackedTransactions[transactionHash],transaction, )
              if (transaction.status === 'CONFIRMED') {
                this.stopTracking(this.trackedTransactions[transactionHash])
              }
            })
          }
        }
      },
      stopTracking(transaction) {
        this.$store.commit('wallet/TRANSACTION_COMPLETE', transaction.key)
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