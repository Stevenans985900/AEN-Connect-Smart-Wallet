<template>
  <!-- New transfer -->
  <v-card>
    <v-form
      ref="makeTransferForm"
      v-model="transferValid"
    >
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12>
              <v-text-field
                v-model="destination.amount"
                label="Amount"
                :suffix="symbol"
                :error-messages="lessThanBalance()"
                required
              />
            </v-flex>
            <v-flex xs12>
              <v-combobox
                v-model="destination.address"
                :items="contacts"
                item-text="displayText"
                label="To"
                prepend-icon="contacts"
                required
              />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                v-model="destination.message"
                label="Optional Message"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="!transferValid" color="blue darken-1" flat @click="initiateTransfer">
          Initiate
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
export default {
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      destination: {
        address: '',
        amount: 0,
        message: '',
        transferValid: false
      }
    }
  },
  computed: {
    symbol() {
      return this.$store.state.wallet.aen.symbol.toUpperCase()
    },
    contacts() {
      return this.$store.getters['wallet/contactsByWallet'](this.wallet)
    }
  },
  methods: {
    lessThanBalance() {
      return (this.destination.amount < this.wallet.balance) ? '' : 'Cannot send more than your balance'
    },
    initiateTransfer() {
      if (!this.$refs.makeTransferForm.validate()) {
        return false
      }
        console.log('getting credentials')
        this.$store.dispatch('security/getCredentials', this.wallet.address).then((credentials) => {
            this.$store.dispatch('wallet/transfer', {
                credentials: credentials,
                source: this.wallet,
                destination: this.destination
            }).then(() => {
                this.$store.commit('showNotification', {
                    type: 'success',
                    message: 'Your transfer has been successfully dispatched to the network'
                })
                this.$emit('complete')
            })
        })



    }
  }
}
</script>
