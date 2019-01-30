<template>
  <component
    v-if="component"
    :is="component"
    :data="transaction"
    :wallet="wallet"
    :display="display"
  />
</template>

<script>
import { TransactionType } from "chain-js-sdk";

export default {
  props: {
    display: {
      type: String,
      default: 'all'
    },
    transaction: {
      type: Object,
      default: function() {
        return {};
      }
    },
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
  mounted() {
    if (this.transaction.hasOwnProperty("type")) {
      switch (this.transaction.type) {
        case TransactionType.REGISTER_NAMESPACE:
          this.type = "Namespace";
          break;
        case TransactionType.TRANSFER:
          this.type = "Transfer";
          break;
        default:
          console.debug("TS:M:Unrecognised transfer type");
      }
    }
    if (this.type) {
      try {
        this.component = () =>
          import("./TransactionStringify/" + this.type);
      } catch (err) {
        console.debug(err);
      }
    } else {
      this.component = () => import("~/components/Fallback");
    }
  }
};
</script>
