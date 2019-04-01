<template>
  <v-menu v-if="haveTrackedTransactions" v-model="menuPendingTransactions" offset-y>
    <v-btn slot="activator" :class="color" icon small>
      <v-icon>
        swap_horiz
      </v-icon>
    </v-btn>

    <v-card max-width="400px">
      <v-card-text>
        <h3>{{ $t('network.label.pending_transactions') }}</h3>
        <v-list>
          <v-list-tile v-for="transaction in trackedTransactions" :key="transaction.key" avatar>
            <v-list-tile-avatar>
              <v-icon>
                {{ icon(transaction) }}
              </v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ transaction.address }}
              </v-list-tile-title>
              <v-list-tile-sub-title>
                {{ transaction.amount }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  export default {
    data() {
      return {
        menuPendingTransactions: false
      }
    },
    computed: {
      haveTrackedTransactions() { return Object.keys(this.trackedTransactions).length > 0 ? true : false },
      trackedTransactions() { return this.$store.state.wallet.trackedTransactions }
    },
    methods: {
      icon(transaction) {
        if(transaction.direction === 'outgoing') {
          return 'call_made'
        }
        return 'call_received'
      }
    }
  }
</script>