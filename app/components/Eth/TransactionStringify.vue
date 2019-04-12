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
    // If the contract address is blank, then it's a plain transfer
    if (this.transaction.value === '0') {
      this.component = () => import('~/components/Eth/TransactionStringify/Contract')
        .catch(function () {
          this.component = () => import('~/components/Default/TransactionStringify')
        }.bind(this))
    } else {
      this.component = () => import('~/components/Eth/TransactionStringify/Transfer')
    }
  }
}
</script>
