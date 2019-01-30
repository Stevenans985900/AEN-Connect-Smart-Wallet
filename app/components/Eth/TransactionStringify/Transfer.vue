<template>
  <span>
    <span v-if="display === 'all' || display === 'direction'">
      <v-icon v-if="direction === 'incoming'">call_received</v-icon>
      <v-icon v-else>call_made</v-icon>
    </span>
    <span v-if="display === 'all' || display === 'date'">{{ date }}</span>
    <span v-if="display === 'all' || display === 'value'">{{ value }}ETH</span>
    <span v-if="display === 'all' || display === 'address'">
      <address-render :address="address" show-add/>
    </span>
    <span v-if="display === 'all' || display === 'details'">Here be the details</span>
  </span>
</template>

<script>
import { format } from "date-fns";
import Web3 from "web3";

export default {
  props: {
    display: {
      type: String,
      default: "all"
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
      web3: {}
    };
  },
  computed: {
    address() {
      if (!this.transaction.hasOwnProperty("from")) return "Unknown";
      return this.transaction.from;
    },
    direction() {
      if (!this.transaction.hasOwnProperty("from")) return "";
      if (
        this.transaction.to.toUpperCase() === this.wallet.address.toUpperCase()
      ) {
        return "incoming";
      } else {
        return "outgoing";
      }
    },
    date() {
      return format(this.transaction.timeStamp * 1000, "YYYY-MM-DD HH:mm");
    },
    value() {
      console.log(this.transaction);
      if (!this.transaction.hasOwnProperty("value")) return "";
      return new Web3().utils.fromWei(
        this.transaction.value.toString(),
        "ether"
      );
    }
  },
  created() {}
};
</script>
