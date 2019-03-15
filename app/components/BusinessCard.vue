<template>
  <component
    :is="component"
    v-if="component"
    :wallet="wallet"
    :use-address-book="useAddressBook"
    :include-private-key="includePrivateKey"
    :private-key-property="privateKeyProperty"
  />
</template>

<script>
export default {
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    },
    useAddressBook: {
      type: Boolean,
      default: true
    },
    includePrivateKey: {
      type: Boolean,
      default: false
    },
    privateKeyProperty: {
      type: String,
      default: ''
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
          this.component = () => import('~/components/' + this.type + '/BusinessCard')
            .catch(function () {
              this.component = () => import('~/components/Default/BusinessCard')
            }.bind(this))
        } else {
          this.component = () => import('~/components/Default/BusinessCard')
        }
      }
    }
  }

}
</script>
