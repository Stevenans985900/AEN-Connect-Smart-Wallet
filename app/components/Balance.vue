<template>
  <v-progress-circular v-if="loading" indeterminate />
  <span v-else>
    <token-value :symbol="symbol" :value="balance" />
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
      switch(this.wallet.type) {
        case 'aen':
          return this.$store.state.wallet.aen.symbol
        case 'btc':
          return this.$store.state.wallet.btc.symbol
        case 'eth':
          return this.$store.state.wallet.eth.symbol
      }
      return 'NA'
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
