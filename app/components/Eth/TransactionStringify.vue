<template>
  <component v-if="component" :is="component" :transaction="transaction" :wallet="wallet"/>
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
      // If the contract address is blank, then it's a plain transfer
      if (this.transaction.contractAddress !== '') {
        this.component = () => import("~/components/Eth/TransactionStringify/" + this.transaction.contractAddress).then(response => {
          console.debug(response)
        })
          .catch(function() {
            this.component = () => import("~/components/Default/TransactionStringify");
          }.bind(this))
      } else {
        this.component = () => import('~/components/Eth/TransactionStringify/Transfer')
      }
    }
  }
</script>