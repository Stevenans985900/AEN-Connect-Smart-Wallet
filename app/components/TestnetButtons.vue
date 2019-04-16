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
          this.component = () => import('~/components/' + this.type + '/TestnetButtons')
            .catch(function () {
              this.component = () => import('~/components/Default/TestnetButtons')
            }.bind(this))
        } else {
          this.component = () => import('~/components/Default/TestnetButtons')
        }
      }
    }
  }

}
</script>
