<template>
  <v-list>
    <v-list-tile>
      <v-list-tile-action>
        <v-select
          v-model="aenDisplaySymbol"
          :items="aenSymbols"
          :label="$t('network.label.aen')"
        />
      </v-list-tile-action>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-action>
        <v-select
          v-model="btcDisplaySymbol"
          :items="btcSymbols"
          :label="$t('network.label.btc')"
        />
      </v-list-tile-action>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-action>
        <v-select
          v-model="ethDisplaySymbol"
          :items="ethSymbols"
          :label="$t('network.label.eth')"
        />
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</template>

<script>
  export default {
    data() {
      return {
        menuShowDenominations: false,
        x: 0,
        y: 0
      }
    },
    computed: {
      aenDisplaySymbol: {
        get: function() {
          return this.$store.state.wallet.aen.displaySymbol
        },
        set: function(value) {
          this.$store.commit('wallet/setAenProperty', {key: 'displaySymbol', value})
          this.$store.commit('emitRenderEvent')
        }
      },
      aenSymbols() { return ['default'].concat(Object.keys(this.$g('exchange.divisibility.aen'))) },
      btcDisplaySymbol: {
        get: function() {
          return this.$store.state.wallet.btc.displaySymbol
        },
        set: function(value) {
          this.$store.commit('wallet/setBtcProperty', {key: 'displaySymbol', value})
          this.$store.commit('emitRenderEvent')
        }
      },
      btcSymbols() { return ['default'].concat(Object.keys(this.$g('exchange.divisibility.btc'))) },
      ethDisplaySymbol: {
        get: function() {
          return this.$store.state.wallet.eth.displaySymbol
        },
        set: function(value) {
          this.$store.commit('wallet/setEthProperty', {key: 'displaySymbol', value})
          this.$store.commit('emitRenderEvent')
        }
      },
      ethSymbols() { return ['default'].concat(Object.keys(this.$g('exchange.divisibility.eth'))) }
    },
    methods: {
      menuToggle(event) {
        this.x = event.clientX - 50
        this.y = event.clientY
        this.menuShowDenominations = !this.menuShowDenominations
      }
    }
  }
</script>