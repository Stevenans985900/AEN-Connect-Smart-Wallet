<template>
  <v-card v-if="haveTrackedTransactions" flat>
    <v-card-text>
      <v-layout v-for="(transaction, txHash) in trackedTransactions" :key="txHash" row wrap align-center>
        <v-flex xs2 sm1>
          <a target="_blank" :href="blockExplorerLink(transaction)">
            <v-icon>
              {{ icon(transaction) }}
            </v-icon>
          </a>
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

<style scoped>
  a {
    text-decoration: none !important;
    display: block;
    color: #fff;
  }
</style>
<script>
  export default {
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
           return this.$store.getters['wallet/trackedTransactionsByWallet'](this.wallet)
        } else {
          console.log(this.$store.state.wallet.trackedTransactions)
          return this.$store.state.wallet.trackedTransactions
        }
      }
    },
    beforeDestroy() {
      clearInterval(this.interval)
    },
    methods: {
      blockExplorerLink(transaction) {
        switch (transaction.type) {
          case 'aen':
            return this.$g('aen.transaction_explorer') + transaction.aenNetworkId
          case 'btc':
            return 'https://live.blockcypher.com/btc-testnet/tx/'+transaction.txHash+'/'
          case 'eth':
            return 'https://'+transaction.network+'.etherscan.io/address/' + transaction.txHash
        }
      },

      remove(transaction) {
        console.log('would stop tracking the following transaction if not for debug', transaction)
        this.$store.commit('wallet/TRANSACTION_REMOVE', transaction.txHash)
      },
      icon(transaction) {
        switch (transaction.status) {
            case 'CONFIRMED': return 'done'
            case 'PENDING': return 'hourglass_empty'
            default: return 'help'
        }
      }
    }
  }
</script>
