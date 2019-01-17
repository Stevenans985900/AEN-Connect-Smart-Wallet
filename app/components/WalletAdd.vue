<template>
  <span>
    <component v-if="component" :is="component" :show-eula="showEula" :main="main" @complete="complete()"/>
  </span>
</template>

<script>
  export default {
    props: {
      main: {
        type: Boolean,
        default: function() {
          return false
        }
      },
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
      complete() {
        this.$emit('complete')
      },
      updateComponent() {
        this.componentName = this.type[0].toUpperCase() + this.type.slice(1)
        if (this.componentName) {
          try {
            this.component = () => import("~/components/" + this.componentName + "/WalletAdd");
          } catch (err) {
            console.debug(err)
            this.component = () => import("./Fallback")
          }
        } else {
          this.component = () => import("./Fallback");
        }
      }
    }

  };
</script>
