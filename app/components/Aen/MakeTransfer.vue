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
              <v-text-field
                v-model="destination.amount"
                :label="$t('common.label.amount')"
                suffix="AEN"
                :error-messages="lessThanBalance()"
                required
              />
            </v-flex>
            <v-flex xs12>
              <v-combobox
                v-model="destination.address"
                :items="contacts"
                item-text="displayText"
                :label="$t('common.label.address')"
                prepend-icon="contacts"
                required
              />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                v-model="destination.message"
                :label="$t('common.label.optional_message')"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="busy == true" flat disabled>
          <v-progress-circular
            indeterminate
          ></v-progress-circular>
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
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      destination: {
        address: '',
        amount: '',
        message: ''
      },
      transferValid: false
    }
  },
  computed: {
    ...mapGetters([
      'busy'
    ]),
    symbol() {
      return this.$store.state.wallet.aen.displaySymbol
    },
    contacts() {
      return this.$store.getters['wallet/contactsByWallet'](this.wallet)
    }
  },
  methods: {
    lessThanBalance() {
      return (this.destination.amount < this.wallet.balance) ? '' : this.$t('wallet.message.cannot_exceed_balance')
    },
    initiateTransfer() {
      if (!this.$refs.makeTransferForm.validate()) {
        return false
      }
        this.$store.dispatch('security/getCredentials', this.wallet.address).then((credentials) => {

          this.$store.commit('setLoading', {
            t: 'page',
            v: true,
            m: this.$t('wallet.message.transfer_start')
          })
          this.$store.dispatch('wallet/transfer', {
              credentials: credentials,
              source: this.wallet,
              destination: this.destination
          }).then(() => {
            this.$store.commit('setLoading', {
              t: 'page',
              v: false
            })
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
