<template>
  <!-- New transfer -->
  <v-card>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex xs12>
            <v-text-field
              v-model="destination.amount"
              label="Amount"
              suffix="XEM"
            />
          </v-flex>
          <v-flex xs12>
            <v-combobox
              v-model="destination.address"
              :items="contacts"
              item-text="displayText"
              label="To"
              prepend-icon="contacts"
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
      <v-btn color="blue darken-1" flat @click="initiateTransfer">
        Initiate
      </v-btn>
    </v-card-actions>
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
        message: ''
      }
    }
  },
  computed: {
    contacts() {
      return this.$store.getters['wallet/contactsByWallet'](this.wallet)
    }
  },
  methods: {
    initiateTransfer() {
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
