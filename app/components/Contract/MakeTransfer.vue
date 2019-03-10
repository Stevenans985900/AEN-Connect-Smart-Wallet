<template>
  <!-- New transfer -->
  <v-card>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex xs12>
            {{ $t('wallet.label.balance') }}: <token-value :symbol="wallet.symbol" :type="wallet.type" :value="wallet.balance" />
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
              :max="maximumGas"
              label="Gas Price"
              step="500000"
              min="100000"
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
    import TokenValue from "~/components/TokenValue"
export default {
  components: { TokenValue },
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
      parentWallet: null
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
    }
  },
  watch: {
    priorityTransfer: function (val) {
      if (val === true) {
        this.gasPrice = this.parentWallet.network.gasPrice.priority
      } else {
        this.gasPrice = this.parentWallet.network.gasPrice.normal
      }
    }
  },
  created() {
    this.parentWallet = this.$store.state.wallet.wallets[this.wallet.managerWalletAddress]
    this.normalGas = this.parentWallet.network.gasPrice.normal
    this.priorityGas = this.parentWallet.network.gasPrice.priority
    this.maximumGas = this.parentWallet.network.gasPrice.maximum
  },
  methods: {
    lessThanBalance() {
        return (this.amount < this.wallet.balance) ? '' : this.$t('wallet.message.cannot_exceed_balance')
    },
    initiateTransfer() {
      this.$store.commit('setLoading', { t: 'page', v: true })
        this.$store.dispatch('security/getCredentials', this.parentWallet.address).then((credentials) => {

            const transactionOptions = {
                source: this.wallet,
                transfer: {
                    gasPrice: this.gasPrice,
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
            console.log('initiating transfer')
            this.$store.dispatch('wallet/transfer', transactionOptions)
                .then((transfer) => {
                    this.$store.commit('setLoading', {t: 'page', v: false})
                    console.debug(transfer)
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
