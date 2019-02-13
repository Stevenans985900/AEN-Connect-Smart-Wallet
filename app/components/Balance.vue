<template>
  <span v-if="balance">
    {{ balance }}
  </span>
  <v-progress-circular v-else indeterminate />
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
  data() {
    return {
      balance: null
    }
  },
  created() {
    this.getBalance()

    setInterval(
      function () {
        this.getBalance()
      }.bind(this),
      this.$g('internal.commonTasksInterval')
    )
  },
  methods: {
    getBalance() {
      if (this.wallet.onChain === true) {
        this.$store.dispatch('wallet/balance', this.wallet).then((response) => {
          this.balance = response.balance
          if(this.wallet.hasOwnProperty('symbol')) { this.balance.concat(this.wallet.symbol) }
        })
      } else {
        this.balance = '0'
      }
    }
  }
}
</script>
