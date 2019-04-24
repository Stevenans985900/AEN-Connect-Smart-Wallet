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
    if (this.transaction.hasOwnProperty('type')) {
      try {
        this.component = () =>
          import('./TransactionStringify/' + this.transaction.type)
      } catch (err) {
        this.$log.debug('AEN Transaction Stringify. Unable to lazy load component', this.transaction.type)
      }
    } else {
      this.component = () => import('~/components/Fallback')
    }
  }
}
</script>
