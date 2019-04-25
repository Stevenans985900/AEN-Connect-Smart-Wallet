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
              {{ $t('wallet.label.parent_balance') }}: <token-value :symbol="symbol" :type="parentWallet.type" :value="parentWallet.balance" /> <br>
              {{ $t('wallet.label.tokens') }}: <token-value :symbol="wallet.symbol" :type="wallet.type" :value="wallet.balance" />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                v-model="amount"
                :label="$t('common.label.amount')"
                :suffix="wallet.symbol"
                :error-messages="lessThanBalance()"
                required
              />
            </v-flex>
            <v-flex xs12>
              <v-combobox
                v-model="address"
                :items="contacts"
                item-text="displayText"
                :label="$t('common.label.address')"
                prepend-icon="contacts"
                required
              />
            </v-flex>
            <v-flex xs12 md6>
              <v-checkbox v-model="priorityTransfer" label="Priority Transfer" />
              <v-text-field
                v-model="gasPrice"
                suffix="Wei"
              />
            </v-flex>
            <v-flex xs12 md6>
              <v-slider
                v-model="gasPrice"
                :color="color"
                label="Gas Price"
                max="50000000000"
                step="2500000000"
                min="5000000000"
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
      web3: {},
      gasPrice: 0,
      gas: '',
      address: '',
      amount: '',
      message: '',
      priorityTransfer: false,
      maximumGas: 0,
      normalGas: 0,
      priorityGas: 0,
      transferValid: false
    }
  },
  computed: {
    color() {
      if (this.gasPrice < (this.normalGas / 2)) return 'red'
      if (this.gasPrice < (this.normalGas)) return 'amber'
      if (this.gasPrice < (this.normalGas + (this.priorityGas - this.normalGas))) return 'light-green'
      if (this.gasPrice < (this.priorityGas)) return 'green'
      // Assumed default: this.gasPrice > (this.priorityGas)
      return 'amber'
    },
    contacts() {
        return this.$store.getters['wallet/contactsByWallet'](this.parentWallet)
    },
    gasPriceGwei: {
        get: function () { return this.gasPrice / 1000000000 },
        set: function (val) { this.gasPrice = val * 1000000000 }
    },
    parentWallet() { return this.$store.state.wallet.wallets[this.wallet.managerWalletAddress] },
    symbol() { return this.$store.state.wallet.eth.displaySymbol }
  },
  watch: {
    priorityTransfer: function (val) {
      if (val === true) {

        this.gasPrice = this.$g(this.parentWallet.type + '.available_networks.' + this.parentWallet.network).gasPrice.priority
      } else {
        this.gasPrice = this.$g(this.parentWallet.type + '.available_networks.' + this.parentWallet.network).gasPrice.normal
      }
    }
  },
  created() {
    this.normalGas = this.$g(this.parentWallet.type + '.available_networks.' + this.parentWallet.network).gasPrice.normal
    this.priorityGas = this.$g(this.parentWallet.type + '.available_networks.' + this.parentWallet.network).priority
    this.maximumGas = this.$g(this.parentWallet.type + '.available_networks.' + this.parentWallet.network).maximum
  },
  methods: {
    lessThanBalance() {
      return (this.amount < this.wallet.balance) ? '' : this.$t('wallet.message.cannot_exceed_balance')
    },
    initiateTransfer() {
        this.$store.dispatch('security/getCredentials', this.parentWallet.address).then((credentials) => {
            const transactionOptions = {
                source: this.wallet,
                transfer: {
                    gasPrice: this.gasPrice,
                  // TODO Change the code here to reflect user input better
                    gas: this.$g("eth.available_networks")[0].gas.transfer, // litre of gas, mileage
                    gasLimit: this.$g("eth.available_networks")[0].gas.transfer + 4000,
                    managerWallet: this.parentWallet,
                    credentials: credentials
                },
                destination: {
                    address: this.address,
                    amount: this.amount
                }
            }
            this.$store.dispatch('wallet/transfer', transactionOptions)
            .then(() => {
              this.$store.commit('showNotification', {
                  type: 'success',
                  message: this.$t('wallet.message.transfer_complete')
              })
              this.$emit('complete')
            })
        })
    }
  }
}
</script>
