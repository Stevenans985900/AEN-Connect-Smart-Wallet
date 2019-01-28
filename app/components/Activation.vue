<template>
  <span>
    <component v-if="component" :is="component" :wallet="wallet" />
  </span>
</template>

<script>
export default {
    props: {
        wallet: {
            type: Object,
            default: function() {
                return {};
            }
        }
    },
    data() {
        return {
            component: null,
            type: ""
        };
    },
    beforeMount() {
        if (Object.keys(this.wallet).length !== 0) {
          this.type = this.wallet.type[0].toUpperCase() + this.wallet.type.slice(1)
          if (this.type) {
            this.component = () => import("~/components/" + this.type + "/Activation")
              .catch(function() {
                this.component = () => import("~/components/Default/Activation");
              }.bind(this))
          } else {
            this.component = () => import("~/components/Fallback");
          }
        }
    }
};
</script>
