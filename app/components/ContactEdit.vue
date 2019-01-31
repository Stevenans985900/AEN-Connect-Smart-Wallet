<template>
  <v-card>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex xs12>
            <v-select
              v-model="inputNetwork"
              :items="networks"
              item-text="display"
              item-value="internalValue"
              label="Network"
              required
            />
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field v-model="inputDisplayText" label="Name" required />
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field
              v-model="inputAddress"
              :readonly="readOnly"
              label="Blockchain Address"
              hint="example: TCQS4NLATONNFT2SEY6Y3SZNQTMXF7O5K7TU7L7F"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" flat @click="save">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    displayText: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    network: {
      type: String,
      default: ''
    },
    showNetwork: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputDisplayText: '',
      inputAddress: '',
      inputNetwork: '',
      readOnly: false,
      networks: [
        {
          display: 'AENChain',
          internalValue: 'aen'
        },
        {
          display: 'Ethereum',
          internalValue: 'eth'
        },
        {
          display: 'Bitcoin',
          internalValue: 'btc'
        },
      ]
    }
  },
  watch: {
    address: function(val) {
      this.inputAddress = val
    },
    displayText: function(val) {
      this.inputDisplayText = val
    },
    network: function(val) {
      this.inputNetwork = val
    }
  },
  methods: {
    save() {
      this.$store.commit('wallet/setContact', {
        'displayText': this.inputDisplayText,
        'address': this.inputAddress,
        'network': this.inputNetwork
      })
      this.$emit('complete')
    }
  }
}
</script>
