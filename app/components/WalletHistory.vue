<template>
  <component :is="component" v-if="component" :wallet="wallet" />
</template>

<script>
export default {
  props: {
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
  watch: {
    wallet: function () {
      this.updateComponent()
    }
  },
  mounted: function () {
    this.updateComponent()
  },
  methods: {
    updateComponent() {
      if (Object.keys(this.wallet).length !== 0) {
        this.type = this.wallet.type[0].toUpperCase() + this.wallet.type.slice(1)
        if (this.type) {
          try {
            this.component = () => import('~/components/' + this.type + '/WalletHistory')
          } catch (err) {
            this.$log.debug('Could not load wallet history component for: ' + this.type)
          }
        } else {
          this.component = () => import('./Fallback')
        }
      }
    }
  }

}
</script>
