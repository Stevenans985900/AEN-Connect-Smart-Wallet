<template>
  <span>
    <v-btn :outline="$vuetify.breakpoint.mdAndUp" small @click="menuToggle" :icon="$vuetify.breakpoint.smAndDown">
      <v-icon>
        local_atm
      </v-icon>
      <span v-if="$vuetify.breakpoint.mdAndUp">
        {{ $t('network.label.token_denomination') }}
      </span>
    </v-btn>

    <v-menu
      v-model="menuShowDenominations"
      :position-x="x"
      :position-y="y"
      :close-on-content-click="false"
      absolute
      offset-y
    >
      <v-list class="pa-4">
        <v-subheader v-if="$vuetify.breakpoint.smAndDown">
          {{ $t('network.label.token_denomination') }}
        </v-subheader>
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
    </v-menu>
  </span>
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