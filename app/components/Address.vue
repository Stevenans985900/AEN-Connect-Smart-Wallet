<template>
  <span>
    <clipboard :data="address" :display-text="displayText" />
    <!-- New transfer -->
    <v-dialog v-if="haveContact === false && showAdd === true" v-model="dialog" persistent max-width="600px">
      <v-btn slot="activator" outline small>
        {{ $t('contact.action.add') }}
      </v-btn>
      <v-toolbar color="primary">
        <v-toolbar-title>{{ $t('contact.action.add') }}</v-toolbar-title>
        <v-spacer />
        <v-btn small icon outline @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <contact-edit :display-text="displayText" :address="address" @complete="contactAdded" />
    </v-dialog>
  </span>
</template>

<script>
import ContactEdit from '~/components/ContactEdit'
import Clipboard from '~/components/Clipboard'
export default {
  components: { Clipboard, ContactEdit },
  props: {
    address: {
      type: String,
      default: ''
    },
    showAdd: {
      type: Boolean,
      default: false
    },
    useAddressBook: {
      type: Boolean,
      default: true
    },
    useReceiverAddress: {
        type: Boolean,
        default: false
    }
  },
  data() {
    return {
      dialog: false
    }
  },
  computed: {
    processedAddress() {
      if(this.useReceiverAddress) {
          return this.$store.state.wallet.wallets[this.address].receiverAddress
      }
      return this.address
    },
    contacts() { return this.$store.state.wallet.contacts },
    haveContact() {
      if (this.contacts.hasOwnProperty(this.address)) {
        return true
      } else {
        return false
      }
    },
    displayText() {
      if (this.haveContact && this.useAddressBook === true) {
        return this.contacts[this.address].displayText
      } else {
        return this.processedAddress
      }
    }
  },
  watch: {
    contacts: {
      handler: function () {
        this.$forceUpdate()
      },
      deep: true
    }
  },
  methods: {
    contactAdded() {
      this.$store.commit('showNotification', {
        type: 'success',
        message: 'Contact added to address book'
      })
      this.dialog = false
    }
  }
}
</script>
