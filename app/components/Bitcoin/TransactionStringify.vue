<template>
  <span>0BTC</span>
</template>

<script>
export default {
  props: {
    transaction: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  mounted() {
   console.debug('Unrecognised transaction type')
   console.debug(this.transaction)
  }
}
</script>
