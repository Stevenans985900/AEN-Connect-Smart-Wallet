<template>
  <component
    :is="component"
    v-if="component"
    :transaction="transaction"
    :wallet="wallet"
    :display="display"
    />
</template>

<script>
export default {
  props: {
    display: {
      type: String,
      default: 'all'
    },
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
    .catch(() => {
      this.component = () => import('~/components/Contract/TransactionStringify/Erc20')
    })
  }
}
</script>
