<template>
  <component :is="component" v-if="component" :transaction="transaction" :wallet="wallet" />
</template>

<script>
export default {
  props: {
    transaction: {
      type: Object,
      default: function () {
        return {}
      }
    },
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      component: null,
      type: ''
    }
  },
  mounted() {
    // Try to import the contract renderer by it's contact address
    this.component = () => import('~/components/Contract/TransactionStringify/' + this.transaction.contractAddress)
      // Fallback to ERC20 on failure
      .catch(function () {
        this.component = () => import('~/components/Contract/TransactionStringify/Erc20')
      }.bind(this))
  }
}
</script>
