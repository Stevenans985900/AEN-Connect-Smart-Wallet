<template>
  <v-layout justify-center align-center>

      <v-container
        fluid
        grid-list-md
      >
        <v-layout row wrap>

          <!-- New transfer -->
          <v-dialog v-model="dialog" persistent max-width="600px">
              <v-btn slot="activator" color="primary" fixed fab bottom right>
                  <v-icon>add</v-icon>
              </v-btn>
              <v-card>
                  <v-card-title>
                      <span class="headline">Make a payment</span>
                  </v-card-title>
                  <v-card-text>
                  <v-container grid-list-md>
                      <v-layout wrap>
                      <v-flex xs12 sm6>
                              <v-combobox
                                  v-model="payee.address"
                                  :items="contacts"
                                  item-text="name"
                                  label="To"
                                  prepend-icon="contacts"
                              />
                      </v-flex>
                      <v-flex xs12 sm6>
                          <v-text-field
                              label="Amount"
                              v-model="payee.amount"
                              suffix="XEM" />
                      </v-flex>
                      <v-flex xs12 sm6>
                          <v-text-field
                              label="Optional Message"
                              v-model="payee.message" />
                      </v-flex>
                      </v-layout>
                  </v-container>
                  </v-card-text>
                  <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
                  <v-btn color="blue darken-1" flat @click="initiateTransfer">Initiate</v-btn>
                  </v-card-actions>
              </v-card>
          </v-dialog>

          <!-- Basic wallet information -->
          <v-flex xs12>
            <v-card>
                <v-layout>
                    <v-flex xs2>
                        AENC Logo
                    </v-flex>
                    <v-flex>
                        <template v-if="account.account.address" >Address: {{ account.account.address.address }}</template>
                        Balance: {{ account.meta.balance }}
                    </v-flex>
                </v-layout>
            </v-card>
          </v-flex>

            <!-- Mining space -->
          <v-flex xs12 sm6>
              <v-card>Mining Space</v-card>
          </v-flex>

        </v-layout>
      </v-container>
  </v-layout>
</template>

<script>
import TransactionStringify from '../components/TransactionStringify'

export default {
	components: {
		TransactionStringify
	},
	data () {
		return {
			dialog: false,
			payee: {
				address: '',
				amount: '',
				message: ''
			}
		}
	},
	created: function () {
		console.log('P:L:Ledger')
		// Only start once global loading finished
		var preperationInterval = setInterval(function () {
			if (this.$store.getters.booting === false) {
				clearInterval(preperationInterval)
				console.log('L:Running Interval')
				// this.$account.transactions()
				this.$store.commit('setLoading', { 't': 'router', 'v': false })
			}
		}.bind(this), 2000)
	},
	methods: {
		isTransactionInOrOut (value) {
			if (!value) return ''
			if (this.$account.$store.state.account.address.hasOwnPropertyType('address')) {
				if (value.address === this.$account.$store.state.account.address.address) {
					return 'call_received'
				} else {
					return 'call_made'
				}
			}
			console.debug('Account state not yet ready')
		},
		initiateTransfer () {
			if (typeof this.payee.address === 'object') {
				this.payee.address = this.payee.address.address
			}
			this.$account.transfer(this.payee)
			var message = 'Transfer in progress'
			this.$store.commit('showNotification', { 'type': 'success', 'message': message })
			this.dialog = false
			// Reset the values
			this.payee.address = ''
			this.payee.amount = ''
		}
	},
	computed: {
		account () { return this.$account.$store.state },
		contacts () { return this.$store.state.contacts },
		transactions () { return this.$account.$store.state.userTransactions }
	}
}
</script>
