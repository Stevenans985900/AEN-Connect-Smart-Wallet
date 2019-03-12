<template>
  <span>
    {{ displayAmount }}{{ symbolShow }}
  </span>
</template>
<script>
export default {
  props: {
    symbol: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    return {
      displayAmount: 0,
      displaySymbol: '',

    }
  },
  computed: {
    symbolShow() {
      return this.displaySymbol.toUpperCase()
    },
    forceRefresh() { return this.$store.state.runtime.renderCounter }
  },
  watch: {
    value() { this.calculateValues() },
    forceRefresh() { console.log('picking up render force'); this.calculateValues() }
  },
  mounted() { this.calculateValues() },
  methods: {
    calculateValues() {

      // Make sure amount is cast to number
      const numeric = Number(this.value)
      if (numeric === 0) {
        return 0
      }
      let first = true
      const divisibilityOptions = this.$g('exchange.divisibility')[this.type]
      // If not displaying currency in any particular manner, try to use the smallest to show
      if (this.symbol === 'default') {
        const typeKeys = Object.keys(divisibilityOptions)
        for (let index = 0; index < typeKeys.length; index++) {
          let divider = divisibilityOptions[typeKeys[index]]
          if(first === true || divider === 0) {
            first = false
            this.displayAmount = numeric.toFixed(2)
            this.displaySymbol = typeKeys[index]
            continue
          }
          if (numeric / divider >= 1) {
            this.displayAmount = (numeric / divider).toFixed(2)
            this.displaySymbol = typeKeys[index]
          } else {
            break
          }

        }
      } else {
        this.displaySymbol = this.symbol

        if(this.type === 'contract') {
            this.displayAmount = numeric
        } else {
            if(divisibilityOptions[this.symbol] === 0) {
              this.displayAmount = numeric.toFixed(2)
            } else {
              this.displayAmount = (numeric / divisibilityOptions[this.symbol]).toFixed(2)
            }
        }
      }
    }
  }
}
</script>
