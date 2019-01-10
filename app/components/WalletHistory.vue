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
    watch: {
      wallet: function() {
        this.updateComponent()
      }
    },
  mounted: function() {
    this.updateComponent()
  },
    methods: {
      updateComponent() {
        if (Object.keys(this.wallet).length !== 0) {
          this.type = this.wallet.type[0].toUpperCase() + this.wallet.type.slice(1)
          if (this.type) {
            try {
              this.component = () => import("./" + this.type + "/WalletHistory");
            } catch (err) {
              console.debug(err);
            }
          } else {
            this.component = () => import("./Fallback");
          }
        }
      }
    }

};
</script>
