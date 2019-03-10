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
      symbolDivisibility: {
        "aen": {
          "aen": 0
        },
        "btc": {
          "bit": -100,
          "sat": 0,
          "btc": 10000000
        },
        "eth": {
          'wei': 0,
          'kwei': 1000,
          'mwei': 1000000,
          'gwei': 1000000000,
          'microether': 1000000000000,
          'milliether': 1000000000000000,
          'ether': 1000000000000000000
        }
      }
    }
  },
  computed: {
    symbolShow() {
      return this.displaySymbol.toUpperCase()
    }
  },
  watch: {
    value() { this.calculateValues() }
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
      // If not displaying currency in any particular manner, try to use the smallest to show
      if (this.symbol === 'default') {
        const typeKeys = Object.keys(this.symbolDivisibility[this.type])
        for (let index = 0; index < typeKeys.length; index++) {
          let divider = this.symbolDivisibility[this.type][typeKeys[index]]
          if(first === true) {
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
            this.displayAmount = (numeric / this.symbolDivisibility[this.type][this.symbol]).toFixed(2)
        }
      }
    }
  }
}
</script>
