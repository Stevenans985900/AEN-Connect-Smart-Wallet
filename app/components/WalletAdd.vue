<template>
  <span>
    <component :is="component" v-if="component" @complete="complete" />
  </span>
</template>

<script>
export default {
  props: {
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
      console.log('loading wallet add component using: ' + this.type)
      if(this.type !== '') {
        const componentName = this.type[0].toUpperCase() + this.type.slice(1)
        console.log(componentName)
        this.component = () => import('~/components/' + componentName + '/WalletAdd')
          .catch(function () {
            this.component = () => import('~/components/Fallback')
          }.bind(this))
        console.log('after component load attempt.')
        }
      }
  }
}
</script>
