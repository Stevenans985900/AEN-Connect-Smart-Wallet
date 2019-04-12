<template>
  <v-list>
    <v-list-tile>
      <v-list-tile-action>
        <v-select
          v-model="walletUpdateInterval"
          :items="possibleTimeIntervals"
          :label="$t('network.label.wallet_update')"
          :suffix="$t('common.label.seconds')"
        />
      </v-list-tile-action>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-action>
        <v-select
          v-model="transactionWatchInterval"
          :items="possibleTimeIntervals"
          :label="$t('network.label.transaction_watch')"
          :suffix="$t('common.label.seconds')"
        />
      </v-list-tile-action>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-action>
        <v-select
          v-model="rankApiInterval"
          :items="possibleTimeIntervals"
          :label="$t('network.label.rank_api')"
          :suffix="$t('common.label.seconds')"
        />
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</template>

<script>
  export default {
    data() {
      return {
        possibleTimeIntervals: [15,30,45,60,75,90,120,150],
        menuShowDenominations: false,
        x: 0,
        y: 0
      }
    },
    computed: {
      rankApiInterval: {
        get: function() {
          return this.$store.state.time_definitions.api_ranking / 1000
        },
        set: function(value) {
          const microSeconds = value * 1000
          this.$store.commit('TIME_DEF', {key: 'api_ranking', value: microSeconds })
        }
      },
      transactionWatchInterval: {
        get: function() {
          return this.$store.state.time_definitions.transaction_watch / 1000
        },
        set: function(value) {
          const microSeconds = value * 1000
          this.$store.commit('TIME_DEF', {key: 'transaction_watch', value: microSeconds })
        }
      },
      walletUpdateInterval: {
        get: function() {
          return this.$store.state.time_definitions.wallet_update / 1000
        },
        set: function(value) {
          const microSeconds = value * 1000
          this.$store.commit('TIME_DEF', {key: 'wallet_update', value: microSeconds })
        }
      },
    }
  }
</script>