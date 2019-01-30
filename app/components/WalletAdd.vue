<template>
  <span>
    <component v-if="component" :is="component" :show-eula="showEula" @complete="complete"/>
  </span>
</template>

<script>
  export default {
    props: {
      showEula: {
        type: Boolean,
        default: function() {
          return false
        }
      },
      type: {
        type: String,
        default: function() {
          return 'aen';
        }
      }
    },
    data() {
      return {
        componentName: '',
        component: null
      };
    },
    watch: {
      type: function() {
        this.updateComponent()
      }
    },
    mounted: function() {
      this.updateComponent()
    },
    methods: {
      complete(wallet) {
        this.$emit('complete', wallet)
      },
      updateComponent() {
        this.componentName = this.type[0].toUpperCase() + this.type.slice(1)
        if (this.componentName) {
          try {
            this.component = () => import("~/components/" + this.componentName + "/WalletAdd");
          } catch (err) {
            console.debug(err)
            this.component = () => import("~/components/Fallback")
          }
        } else {
          this.component = () => import("~/components/Fallback");
        }
      }
    }

  };
</script>
