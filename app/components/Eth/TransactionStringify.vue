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
      console.debug(this.transaction)
      if (this.type) {
        this.component = () => import("~/components/Eth/TransactionStringify/" + this.type).then(response => {
          console.debug(response)
        })
          .catch(function() {
            this.component = () => import("~/components/Default/TransactionStringify");
          }.bind(this))
      } else {
        this.component = () => import('~/components/Default/TransactionStringify')
      }
    }
  }
</script>