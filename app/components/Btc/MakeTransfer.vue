<template>
  <!-- New transfer -->
  <v-card>
    <v-form
      ref="makeTransferForm"
      v-model="transferValid"
    >
      <v-card-text>
        <v-container grid-list-md>
          <v-layout row wrap>
            <v-flex xs12>
              {{ $t('wallet.label.balance') }}: <token-value :symbol="symbol" :type="wallet.type" :value="wallet.balance" />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                v-model="amount"
                :label="$t('common.label.amount')"
                :suffix="symbol.toUpperCase()"
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
                append-outer-icon="contacts"
                required
              />
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
import { mapGetters } from 'vuex'
function initialDataState() {
  return {
    transferValid: false,
    address: '',
    amount: 0
  }
}
export default {
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() { return initialDataState() },
  computed: {
    ...mapGetters([
      'busy'
    ]),
    contacts() {
      return this.$store.getters['wallet/contactsByWallet'](this.wallet)
    },
    symbol() {
        return this.$store.state.wallet.btc.displaySymbol
    }
  },
  methods: {
      lessThanBalance() {
          return (this.amount < this.wallet.balance) ? '' : this.$t('wallet.message.cannot_exceed_balance')
      },
    initiateTransfer() {
      if (!this.$refs.makeTransferForm.validate()) {
          return false
      }

      this.$store.dispatch('security/getCredentials', this.wallet.address).then((credentials) => {
        this.$store.dispatch('wallet/transfer', {
          credentials: credentials,
          source: this.wallet,
          destination: {
              address: this.address,
              amount: this.amount
          }
        }).then(() => {
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
