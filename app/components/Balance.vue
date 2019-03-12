<template>
  <v-progress-circular v-if="loading" indeterminate />
  <span v-else>
    <token-value :symbol="symbol" :value="balance" :type="wallet.type" />
  </span>
</template>

<script>
  import TokenValue from '~/components/TokenValue'

export default {
    components: { TokenValue },
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      loading: true
    }
  },
  computed: {
    balance() {
      return this.$store.state.wallet.wallets[this.wallet.address].balance
    },
    symbol() {
      try {
        return this.$store.state.wallet[this.wallet.type].displaySymbol
      } catch (e) {
        return this.wallet.symbol
      }
    }
  },
  watch: {
    wallet: {
      handler: function() {
        if(this.wallet.onChain === true) {
          this.startListener()
        }
      },
      deep: true
    }
  },
  created() {
    if(this.wallet.onChain === true) {
      this.startListener()
    } else {
      this.loading = false
    }
  },
  methods: {
    startListener() {
      this.loading = true
      this.$store.dispatch('wallet/balance', this.wallet).then(() => {
        this.loading = false
      })
      setInterval(
        function () {
          this.loading = true
          this.$store.dispatch('wallet/balance', this.wallet).then(() => {
            this.loading = false
          })
        }.bind(this),
        this.$g('internal.commonTasksInterval')
      )
    }
  }
}
</script>
