<template>
  <span>
    <!--<v-flex :class="buttonWidth">-->
    <clipboard :data="address" :display-text="displayText" :wide="$vuetify.breakpoint.smAndDown" />
    <!--</v-flex>-->
    <!--<v-flex-->
    <!--v-if=""-->
    <!--xs1-->
    <!--class="text-xs-left"-->
    <!--&gt;-->
    <!-- New transfer -->
    <v-dialog v-if="displayAddButton" v-model="dialog" persistent max-width="600px">
      <v-btn slot="activator" small icon class="ml-0">
        <v-icon>
          add
        </v-icon>
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
    <!--</v-flex>-->
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
    buttonWidth() { return (this.showAdd && this.haveContact === false) ? '' : 'xs12' },
    processedAddress() {
      return this.address
    },
    contacts() { return this.$store.state.wallet.contacts },
    haveContact() {
      if (this.contacts.hasOwnProperty(this.address.toLowerCase())) {
        return true
      } else {
        return false
      }
    },
    displayText() {
      if (this.haveContact && this.useAddressBook === true) {
        return this.contacts[this.address.toLowerCase()].displayText
      } else {
        return this.processedAddress
      }
    },
    displayAddButton() {
        return (
            this.$vuetify.breakpoint.mdAndUp === true &&
            this.haveContact === false &&
            this.showAdd === true
        ) ? true : false
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
        message: this.$t('contact.message.added')
      })
      this.dialog = false
    }
  }
}
</script>
