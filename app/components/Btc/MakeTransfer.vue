<template>
  <!-- New transfer -->
  <v-card>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field
              v-model="destination.amount"
              :label="$t('common.label.amount')"
              suffix="BTC"
            />
          </v-flex>
          <v-flex xs12>
            <v-combobox
              v-model="destination.address"
              :items="contacts"
              item-text="displayText"
              label="To"
              append-outer-icon="contacts"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" flat @click="initiateTransfer">
        {{ $t('common.action.send') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>

function initialDataState() {
  return {
    destination: {
      address: '',
      amount: 0,
      message: ''
    }
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
    contacts() {
      return this.$store.getters['wallet/contactsByWallet'](this.wallet)
    }
  },
  methods: {
    initiateTransfer() {
      this.$store.commit('setLoading', {
        t: 'page',
        v: true,
        m: this.$t('wallet.message.transfer_start')
      })
      this.$store.dispatch('wallet/transfer', {
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
    }
  }
}
</script>
