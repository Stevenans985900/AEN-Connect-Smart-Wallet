<template>
  <v-menu v-if="testnet" offset-y>
    <v-btn
      slot="activator"
    >
      TestNet Functions
    </v-btn>
    <v-list>
      <v-list-tile
        :href="faucet.address + '?address=' + wallet.address"
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
      return this.$g('aen.faucets')[0]
    },
    testnet() {
      if (this.wallet.network.hasOwnProperty('testing')) {
        return true
      }
      return false
    }
  },
  methods: {
    checkWalletLive(wallet) {
      this.$store.dispatch('wallet/checkWalletLive', wallet).then((response) => {
        this.$store.commit('wallet/setProperty', {
          address: wallet.address,
          key: 'onChain',
          value: response
        })
        if (response === true) {
          this.$store.commit('showNotification', {
            type: 'success',
            message: 'The wallet is recognised on the blockchain'
          })
        } else {
          this.$store.commit('showNotification', {
            type: 'info',
            message: 'The wallet is not yet recognised on the blockchain'
          })
        }
      })
    }
  }
}
</script>
