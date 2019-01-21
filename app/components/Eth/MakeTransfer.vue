<template>
  <!-- New transfer -->
  <v-card>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex xs12>
            <p>Current gas price: {{ gasPrice }}</p>
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
          <v-flex xs12 sm6>
            <v-text-field
              v-model="amount"
              label="Amount"
              suffix="ETH"/>
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field
              v-model="gas"
              label="Gas"
              suffix="wei"/>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer/>
      <v-btn color="blue darken-1" flat @click="initiateTransfer">Initiate</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  import Web3 from "web3"

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
        gas: 0,
        address: '',
        amount: 0,
        message: ''
      }
    },
    // watch
    computed: {
      contacts() {
        return this.$store.state.wallet.contacts
      }
    },
    created() {
      this.web3 = new Web3(this.$store.state.wallet.ethereum.activeApiEndpoint)
      this.web3.eth.getGasPrice().then(gasPrice => {
        this.gasPrice = gasPrice
      })
    },
    methods: {
      initiateTransfer() {
        this.$store.commit("setLoading", { t: "page", v: true })
        let transactionOptions = {
          source: this.wallet,
          transfer: {
            gas: this.gas,
            gasLimit: (this.gas + 10000)
          },
          destination: {
            address: this.address,
            amount: this.amount
          }
        }
        console.log('initiating transfer')
        this.$store.dispatch('wallet/transfer', transactionOptions)
        .then((transfer) => {
          this.$store.commit("setLoading", { t: "page", v: false })
          console.debug(transfer)
          this.$store.commit("showNotification", {
            type: "success",
            message: "Your transfer has been successfully dispatched to the network"
          })
          this.$emit('complete')
        })
      }
    }
  }
</script>