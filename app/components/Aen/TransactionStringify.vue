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
import { TransactionType } from 'chain-js-sdk'

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
      switch (this.transaction.type) {
        case TransactionType.REGISTER_NAMESPACE:
          this.type = 'Namespace'
          break
        case TransactionType.TRANSFER:
          this.type = 'Transfer'
          break
        default:
          this.$log.error('AEN Transaction Stringify. Unhandle transfer type', this.transaction.type)
      }
    }
    if (this.type) {
      try {
        this.component = () =>
          import('./TransactionStringify/' + this.type)
      } catch (err) {
        this.$log.debug('AEN Transaction Stringify. Unable to lazy load component', this.type)
      }
    } else {
      this.component = () => import('~/components/Fallback')
    }
  }
}
</script>
