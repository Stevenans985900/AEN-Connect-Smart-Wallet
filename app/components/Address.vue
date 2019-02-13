<template>
  <span>
    <v-btn v-clipboard:copy="address" v-clipboard:success="onCopy" flat small
           :class="{'smaller-font': $vuetify.breakpoint.smAndDown}"
    >
      <v-icon small>
        file_copy
      </v-icon>&nbsp;&nbsp;{{ displayText }}
    </v-btn>

    <!-- New transfer -->
    <v-dialog v-if="haveContact === false && showAdd === true" v-model="dialog" persistent max-width="600px">
      <v-btn slot="activator" outline small>
        Add
      </v-btn>
      <v-toolbar color="primary">
        <v-toolbar-title>Add Contact</v-toolbar-title>
        <v-spacer />
        <v-btn small fab outline @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <contact-edit :display-text="displayText" :address="address" @complete="contactAdded" />
    </v-dialog>
  </span>
</template>

<style scoped>
  .smaller-font {
    font-size: 0.6rem;
  }
</style>
<script>
import ContactEdit from '~/components/ContactEdit'
export default {
  components: { ContactEdit },
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
    }
  },
  data() {
    return {
      dialog: false
    }
  },
  computed: {
    haveContact() {
      if (this.$store.state.wallet.contacts.hasOwnProperty(this.address)) {
        return true
      } else {
        return false
      }
    },
    displayText() {
      if (this.haveContact && this.useAddressBook === true) {
        return this.$store.state.wallet.contacts[this.address].displayText
      } else {
        return this.address
      }
    }
  },
  methods: {
    onCopy() {
      this.$store.commit('showNotification', {
        type: 'success',
        message: 'Address copied to clipboard'
      })
    },
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
