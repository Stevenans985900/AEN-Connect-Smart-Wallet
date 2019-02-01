<template>
  <component
    :is="component"
    v-if="component"
    :data="transaction"
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
    console.debug(this.transaction)
    if (this.transaction.value === '0') {
      this.component = () => import('~/components/Eth/TransactionStringify/Contract')
        .catch(function () {
          this.component = () => import('~/components/Default/TransactionStringify')
        }.bind(this))
    } else {
      console.log('showing plain transaction')
      this.component = () => import('~/components/Eth/TransactionStringify/Transfer')
    }
  }
}
</script>
