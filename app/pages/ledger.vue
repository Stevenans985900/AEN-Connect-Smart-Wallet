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
                      v-model="payee.amount"
                      label="Amount"
                      suffix="XEM"/>
                  </v-flex>
                  <v-flex xs12 sm6>
                    <v-text-field
                      v-model="payee.message"
                      label="Optional Message"/>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
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
                <template v-if="account.wallet.address">Address: {{ account.wallet.address.address }}
                </template>
                Balance: {{ account.meta.balance }}
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>

        <!-- Current / Historical transactions -->
        <v-flex xs12>
          <v-card>
            <v-tabs
              centered
              color="cyan"
              dark
              icons-and-text
            >
              <v-tabs-slider color="yellow"/>

              <v-tab href="#historical">Historical</v-tab>
              <v-tab href="#incoming">Incoming ({{ transactions.incoming.length }})</v-tab>
              <v-tab href="#outgoing">Outgoing ({{ transactions.outgoing.length }})</v-tab>
              <v-tab href="#unconfirmed">Unconfirmed ({{ transactions.unconfirmed.length }})</v-tab>

              <!-- Historical -->
              <v-tab-item value="historical">
                <v-card flat>
                  <v-card-text v-if="transactions.historical">

                    <v-expansion-panel>
                      <v-expansion-panel-content
                        v-for="(transaction,index) in transactions.historical"
                        :key="index"
                      >
                        <div slot="header">
                          <transaction-stringify :transaction="transaction"/>
                        </div>
                        <v-card>
                          <v-card-text>
                            <hr>
                          </v-card-text>
                        </v-card>
                      </v-expansion-panel-content>
                    </v-expansion-panel>

                  </v-card-text>
                  <v-card-text v-else>
                    No Transactions
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Incoming Transactions -->
              <v-tab-item value="incoming">
                <v-card flat>
                  <v-card-text>
                    <v-expansion-panel>
                      <v-expansion-panel-content
                        v-for="(transaction,index) in transactions.incoming"
                        :key="index"
                      >
                        <div slot="header">
                          <transaction-stringify :transaction="transaction"/>
                        </div>
                        <v-card>
                          <v-card-text>
                            <hr>
                          </v-card-text>
                        </v-card>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Outgoing transactions -->
              <v-tab-item value="outgoing">
                <v-card flat>
                  <v-card-text>
                    <v-expansion-panel>
                      <v-expansion-panel-content
                        v-for="(transaction,index) in transactions.outgoing"
                        :key="index"
                      >
                        <div slot="header">
                          <transaction-stringify :transaction="transaction"/>
                        </div>
                        <v-card>
                          <v-card-text>
                            <hr>
                          </v-card-text>
                        </v-card>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <v-tab-item value="unconfirmed">
                <v-card flat>
                  <v-card-text>
                    <v-expansion-panel>
                      <v-expansion-panel-content
                        v-for="(transaction,index) in transactions.unconfirmed"
                        :key="index"
                      >
                        <div slot="header">
                          <transaction-stringify :transaction="transaction"/>
                        </div>
                        <v-card>
                          <v-card-text>
                            <hr>
                          </v-card-text>
                        </v-card>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-card>
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
		data() {
			return {
				dialog: false,
				payee: {
					address: '',
					amount: '',
					message: ''
				}
			}
		},
		computed: {
			account() {
				return this.$account.$store.state
			},
			contacts() {
				return this.$store.state.contacts
			},
			transactions() {
				return this.$account.$store.state.userTransactions
			}
		},
		created: function () {
			console.log('P:L:Ledger')
			// Only start once global loading finished
			var preperationInterval = setInterval(function () {
				if (this.$store.getters.booting === false) {
					clearInterval(preperationInterval)

					this.$account.startListeners()

					this.$store.commit('setLoading', {'t': 'router', 'v': false})
				}
			}.bind(this), 2000)
		},
		methods: {
			isTransactionInOrOut(value) {
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
			initiateTransfer() {
				if (typeof this.payee.address === 'object') {
					this.payee.address = this.payee.address.address
				}
				this.$account.transfer(this.payee)
				var message = 'Transfer in progress'
				this.$store.commit('showNotification', {'type': 'success', 'message': message})
				this.dialog = false
				// Reset the values
				this.payee.address = ''
				this.payee.amount = ''
			}
		},
	}
</script>
