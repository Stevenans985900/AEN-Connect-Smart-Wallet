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
        this.component = () => import('~/components/' + this.type + '/Activation')
          .catch(function () {
            this.component = () => import('~/components/Default/Activation')
          }.bind(this))
      }
    }
  }
}
</script>
