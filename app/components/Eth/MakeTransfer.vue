<template>
  <!-- New transfer -->
  <v-card>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex xs12>
            <p>Current Gas Price: {{ gasPrice / 1000000000 }} Gwei</p>
          </v-flex>
          <v-flex xs12>
            <v-combobox
              v-model="address"
              :items="contacts"
              item-text="displayText"
              label="To"
              prepend-icon="contacts"
            />
          </v-flex>
          <v-flex xs12>
            <v-text-field v-model="amount" label="Amount" suffix="ETH" />
          </v-flex>
          <v-flex xs-12>
            <v-checkbox v-model="priorityTransfer" label="Priority Transfer" />
            <v-slider
              v-model="gasPrice"
              :color="color"
              :max="maximumGas"
              label="Gas Price"
              step="5000"
              min="1"
              thumb-label
              ticks
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" flat @click="initiateTransfer">
        Initiate
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
    // import Web3 from "web3"
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
        web3: {},
        gasPrice: 0,
        gasPriceGwei: 0,
        gas: 0,
        address: '',
        amount: 0,
        message: '',
        priorityTransfer: false,
        maximumGas: 0,
        normalGas: 0,
        priorityGas: 0
      }
    },
      // watch: {
      //   gasPrice() {
      //       // this.gasPriceGwei = Web3.utils.fromWei(this.gasPrice, "Gwei")
      //       this.gasPriceGwei = this.gasPrice / 1000000000
      //       console.log('Hello Something is happening.......')
      //   }
      // },
    computed: {
      color () {
        if(this.gasPrice < (this.normalGas / 2)) return 'red'
        if(this.gasPrice < (this.normalGas)) return 'amber'
        if(this.gasPrice < (this.normalGas + (this.priorityGas - this.normalGas))) return 'light-green'
        if(this.gasPrice < (this.priorityGas)) return 'green'
        // Assumed default: if(this.gasPrice > (this.priorityGas))
        return 'amber'
      },
      contacts() {
        return Object.values(this.$store.state.wallet.contacts)
      }
    },
    watch: {
      priorityTransfer: function(val) {
        if(val === true) {
          this.gasPrice = this.$g("eth.available_networks")[0].gasPrice.priority
        } else {
          this.gasPrice = this.$g("eth.available_networks")[0].gasPrice.normal
        }
      }
    },
    created() {
      this.normalGas = this.$g("eth.available_networks")[0].gasPrice.normal
      // this.normalGas = this.wallet.network.gasPrices.normal
      this.priorityGas = this.wallet.network.gasPrices.priority
      this.maximumGas = this.wallet.network.gasPrices.maximum
    },
    methods: {
      initiateTransfer() {
        this.$store.commit("setLoading", { t: "page", v: true })
        let transactionOptions = {
          source: this.wallet,
          transfer: {
            gasPrice: this.gasPrice, // Cost per litre of gas (1 GWei = 1,000,000,000 Wei)
            gas: this.$g("eth.available_networks")[0].gas.normal, // litre of gas, mileage
            gasLimit: this.$g("eth.available_networks")[0].gas.normal + 4000 // full tank
          },
          destination: {
            address: this.address,
            amount: this.amount
          }
        }
        console.log('initiating transfer')
        this.$store.dispatch('wallet/transfer', transactionOptions)
        .then((transfer) => {
          this.$store.commit('setLoading', { t: 'page', v: false })
          console.debug(transfer)
          this.$store.commit('showNotification', {
            type: 'success',
            message:
              'Your transfer has been successfully dispatched to the network'
          })
          this.$emit('complete')
        })
    }
  }
}
</script>
