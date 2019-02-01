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
  },
  methods: {
    getBalance() {
      if (this.wallet.onChain === true) {
        this.$store.dispatch('wallet/balance', this.wallet).then((response) => {
          this.balance = response.balance
        })
      } else {
        this.balance = '0'
      }
    }
  }
}
</script>
