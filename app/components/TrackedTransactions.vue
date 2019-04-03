<template>
  <span v-if="trackedTransactions.length > 0">
    <h3>{{ $t('network.label.pending_transactions') }}</h3>
    <v-layout v-for="transaction in trackedTransactions" :key="transaction.key" row wrap>
      <v-flex xs2 sm1>
        <v-icon>
          {{ icon(transaction) }}
        </v-icon>
      </v-flex>
      <v-flex xs8 sm10>
        {{ transaction.address }}<br />
        <span class="caption">
          <token-value :value="transaction.amount" :type="transaction.type" />
        </span>
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
  </span>
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
      processTrackedTransactions() {
        if(this.haveTrackedTransactions === true) {
          for(let transactionHash in this.trackedTransactions) {
            this.$store.dispatch('wallet/transactionStatus', this.trackedTransactions[transactionHash]).then((transaction) => {
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