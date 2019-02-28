<template>
  <span>
    {{ amount }}{{ symbolShow }}
  </span>
</template>
<script>
export default {
  props: {
    symbol: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    return {
      symbolDivisibility: {
        'aen': 0,
        'btc': 0,
        'wei': 0,
        'kwei': 1000,
        'mwei': 1000000,
        'gwei': 1000000000,
        'microether': 1000000000000,
        'milliether': 1000000000000000,
        'ether': 1000000000000000000
      }
    }
  },
  computed: {
    amount() {
      // Make sure amount is cast to number
      const numeric = Number(this.value)
      if(numeric === 0) { return 0 }
      if(this.symbolDivisibility[this.symbol] === 0) { return numeric }
      return (numeric / this.symbolDivisibility[this.symbol])
    },
    symbolShow() {
      return this.symbol.toUpperCase()
    }
  }
}
</script>