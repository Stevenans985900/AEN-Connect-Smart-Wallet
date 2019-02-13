<template>
  <v-menu v-if="testnet" offset-y>
    <v-btn
      slot="activator"
      small
    >
      TestNet Functions
    </v-btn>
    <v-list>
      <v-list-tile
        :href="faucet.address"
        target="_blank"
      >
        <v-list-tile-title>Visit Faucet</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>

export default {
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  computed: {
    faucet() {
      return this.$g('bitcoin.faucets')[0]
    },
    testnet() {
      if (this.wallet.network.hasOwnProperty('testing')) {
        return true
      }
      return false
    }
  }
}
</script>
