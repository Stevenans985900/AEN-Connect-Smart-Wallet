<template>
  <v-expansion-panel>
    <v-expansion-panel-content>
      <div slot="header">
        <v-icon v-if="direction === 'incoming'"> call_received </v-icon>
        <v-icon v-else>call_made</v-icon>
        - {{ date }} - {{ value }}ETH - <address-render :address="address" show-add />
        <hr>
      </div>
      <v-card>
        <v-card-text>
          here be the details of the transaction
        </v-card-text>
      </v-card>

    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import { format } from 'date-fns'
import Web3 from "web3"

export default {
    props: {
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
            if (this.transaction.to.toUpperCase() === this.wallet.address.toUpperCase()) {
                return "incoming";
            } else {
                return "outgoing";
            }
        },
        date() {
          return format((this.transaction.timeStamp*1000), 'YYYY-MM-DD HH:mm')
        },
        value() {
            return this.web3.utils.fromWei(this.transaction.value, "ether");
        }
    },
    created() {
        this.web3 = new Web3();
    }
};
</script>
