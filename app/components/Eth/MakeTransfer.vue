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
              {{ $t('wallet.label.balance') }}: <token-value :symbol="symbol" :type="wallet.type" :value="wallet.balance" />
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
              <v-layout row wrap>
                <v-flex xs6>
                  <v-text-field v-model="gasPriceGwei" label="Gas Price" suffix="Gwei" />
                </v-flex>
                <v-flex xs6>
                  <v-checkbox v-model="priorityTransfer" label="Priority Transfer" />
                </v-flex>
                <v-flex xs12>
                  <v-slider
                    v-model="gasPrice"
                    :color="color"
                    :max="50000000000"
                    step="2500000000"
                    min="5000000000"
                    thumb-label
                    ticks
                  />
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="busy == true" flat disabled>
          <v-progress-circular indeterminate />
          {{ $t('network.message.broadcasting_please_wait') }}
        </v-btn>
        <v-spacer />
        <v-btn :disabled="!transferValid || busy == true" color="blue darken-1" flat @click="initiateTransfer">
          {{ $t('common.action.send') }}
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
  import TokenValue from "~/components/TokenValue"
  import { mapGetters } from 'vuex'
  export default {
    components: { TokenValue },
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
        message: '',
        priorityTransfer: false,
        maximumGas: 0,
        normalGas: 0,
        priorityGas: 0,
        transferValid: false
      }
    },
    computed: {
      ...mapGetters([
        'busy'
      ]),
      color () {
        if(this.gasPrice < (this.normalGas / 2)) return 'red'
        if(this.gasPrice < (this.normalGas)) return 'amber'
        if(this.gasPrice < (this.normalGas + (this.priorityGas - this.normalGas))) return 'light-green'
        if(this.gasPrice < (this.priorityGas)) return 'green'
        // Assumed default: if(this.gasPrice > (this.priorityGas))
        return 'amber'
      },
      contacts() {
        return this.$store.getters['wallet/contactsByWallet'](this.wallet)
      },
      // Used to convert nice number for frontend use
      gasPriceGwei: {
        get: function () { return this.gasPrice / 1000000000 },
        set: function (val) { this.gasPrice = val * 1000000000 }
      },
      symbol() {
        return this.$store.state.wallet.eth.displaySymbol
      }
    },
    watch: {
      priorityTransfer: function(val) {
        if(val === true) {
          this.gasPrice = this.wallet.network.gasPrice.priority
        } else {
          this.gasPrice = this.wallet.network.gasPrice.normal
        }
      }
    },
    mounted() {
      this.normalGas = this.wallet.network.gasPrice.normal
      this.gas = this.normalGas
      this.gasPrice = this.normalGas
      this.priorityGas = this.wallet.network.gasPrice.priority
      this.maximumGas = this.wallet.network.gasPrice.maximum
    },
    methods: {
      initiateTransfer() {

        this.$store.dispatch('security/getCredentials', this.wallet.address).then((credentials) => {
          this.$store.dispatch('busy', 'wallet.message.transfer_start')

          this.$store.dispatch('wallet/transfer', {
            credentials: credentials,
            source: this.wallet,
            transfer: {
              gasPrice: this.gasPrice, // Cost per litre of gas (1 GWei = 1,000,000,000 Wei)
              gas: this.$g("eth.available_networks")[0].gas.transfer, // litre of gas, mileage
              gasLimit: this.$g("eth.available_networks")[0].gas.transfer + 4000 // full tank
            },
            destination: {
              address: this.address,
              amount: this.amount.toString()
            }
          }).then((receipt) => {
            console.log('receipt from the transaction')
            console.log(receipt)

            // Start watching the transaction until complete
            // const networkHandler = this.$store.getters['wallet/networkHandler']('eth')
            // const apiEndpoint = this.$store.state.wallet.eth.activeApiEndpoint
            //     .replace('###NETWORK_IDENTIFIER###', this.wallet.network.identifier)
            // networkHandler.setProvider(apiEndpoint)
            // const transactionWatcherInterval = setInterval(() => {
            //   networkHandler.receipt().then((result) => {
            //     if(result === true) {
            //       this.$store.commit('showNotification', {
            //         type: 'success',
            //         message: this.$t('wallet.message.transfer_complete')
            //       })
            //       clearInterval(transactionWatcherInterval)
            //     }
            //   })
            // }, this.$store.state.time_definitions.transaction_watch)
            console.log('complete')
            this.$emit('complete')
          })
            .catch((err) => {
              this.$log.debug('Problem making transfer', err)
            })
        })
      }
    }
  }
</script>
