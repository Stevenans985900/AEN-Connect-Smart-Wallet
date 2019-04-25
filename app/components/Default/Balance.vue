<template>
  <token-value :symbol="symbol" :value="balance" :type="wallet.type" />
</template>

<script>
  export default {
    props: {
      wallet: {
        type: Object,
        required: true
      }
    },
    data() {
      return {}
    },
    computed: {
      balance() {
        return this.wallet.balance
      },
      symbol() {
        try {
          return this.$store.state.wallet[this.wallet.type].displaySymbol
        } catch (e) {
          return this.wallet.symbol
        }
      }
    }
  }
</script>
