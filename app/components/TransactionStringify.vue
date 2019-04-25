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
      const walletType = this.wallet.type[0].toUpperCase() + this.wallet.type.slice(1)
      // Try and get the template from network type if template exists
      console.log('trying to pull in ' + '~/components/'+walletType+'/TransactionStringify/' + this.transaction.type)
      this.component = () =>
        import('~/components/'+walletType+'/TransactionStringify/' + this.transaction.type)
          .catch(function () {
            this.component = () => import('~/components/Default/TransactionStringify/' + this.transaction.type)
          }.bind(this))
    }
}
</script>
