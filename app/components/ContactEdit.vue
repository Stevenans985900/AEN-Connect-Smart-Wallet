<template>
  <v-card>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field
              v-model="contact.displayText"
              :error-messages="contactNameAvailable()"
              :label="$t('common.label.name')"
              required
              @keyup.enter="save"
            />
          </v-flex>
          <v-flex v-if="!existingContact" xs12>
            <v-text-field
              v-model="contact.address"
              :label="$t('common.label.address')"
              required
            />
          </v-flex>
          <v-flex v-if="!existingContact" xs12>
            <v-combobox
              v-model="contact.type"
              :label="$t('common.label.network')"
              :items="availableNetworks"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" flat @click="save">
        {{ $t('common.action.save') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
function initialDataState() {
  return {
    availableNetworks: [
      'aen',
      'btc',
      'eth'
    ],
    contact: {
      address: '',
      displayText: '',
      type: ''
    },
    existingContact: false
  }
}

export default {
  props: {
    address: {
      type: String,
      default: ''
    }
  },
  data() { return initialDataState() },
  watch: {
    address: function() {
      this.processAddress()
    }
  },
  mounted() {
    this.processAddress()
  },
  beforeDestroy() {
    this.reset()
  },
  methods: {
    contactNameAvailable() {
      if(this.existingContact === false) {
        return this.$store.getters['wallet/contactByProperty']({
          property: 'name',
          value: this.contact.displayText
        }) ? this.$t('common.message.name_already_used') : ''
      }
      return ''
    },
    processAddress() {
      if (this.address !== '') {
        this.contact.address = this.address.toLowerCase()
  // Try and get details of the contact if existing
        if(this.$store.state.wallet.contacts.hasOwnProperty(this.address)) {
          this.contact.displayText = this.$store.state.wallet.contacts[this.address].displayText
          this.contact.type = this.$store.state.wallet.contacts[this.address].type
        }
        this.existingContact = true
      } else {
        this.reset()
      }
    },
    reset() {
      Object.assign(this.$data, initialDataState())
    },
    save() {
      this.$store.commit('wallet/setContact', this.contact)
      this.$emit('complete')
      this.reset()
    }
  }
}
</script>
