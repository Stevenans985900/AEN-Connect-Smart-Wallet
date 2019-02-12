<template>
  <span>
    <component :is="component" v-if="component" :main="main" @complete="complete" />
  </span>
</template>

<script>
export default {
  props: {
    main: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      componentName: null,
      component: null
    }
  },
  mounted: function () {
    this.updateComponent()
  },
  methods: {
    complete(wallet) {
      this.$emit('complete', wallet)
    },
    updateComponent() {
      if(this.type !== '') {
        const componentName = this.type[0].toUpperCase() + this.type.slice(1)
        console.log(componentName)
        this.component = () => import('~/components/' + componentName + '/WalletAdd')
          .catch(function () {
            this.component = () => import('~/components/Fallback')
          }.bind(this))
        }
      }
  }
}
</script>
