<template>
  <v-layout row justify-center align-center>
    <!-- Contacts table -->
    <v-flex xs12>
      <v-toolbar class="primary">
        <v-toolbar-title>
          Address Book
        </v-toolbar-title>
        <v-spacer />
        <v-btn color="success" @click="dialogEditContact = true; address = ''">
          <v-icon>add</v-icon>Add Contact
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          />
        </v-card-title>
        <v-data-table :headers="headers" :items="contacts" :search="search">
          <template slot="items" slot-scope="props">
            <td><wallet-image :wallet="props.item" /></td>
            <td>{{ props.item.displayText }}</td>
            <td>
              <address-render :address="props.item.address" :use-address-book="false" />
            </td>
            <td class="justify-center layout px-0">
              <v-icon small class="mr-2" @click="editContact(props.item)">
                edit
              </v-icon>
              <v-icon small @click="dialogDeleteContact = true;contact = props.item">
                delete
              </v-icon>
            </td>
          </template>
          <v-alert
            slot="no-results"
            :value="true"
            color="error"
            icon="warning"
          >
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-card>
    </v-flex>

    <!-- Dialog contact edit form -->
    <v-dialog v-model="dialogEditContact" persistent max-width="600px">
      <v-toolbar color="primary">
        <v-toolbar-title>
          Contact
        </v-toolbar-title>
        <v-spacer />
        <v-btn small fab outline @click="dialogEditContact = false; address = ''">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <contact-edit :address="address" @complete="contactSaved" />
    </v-dialog>

    <!-- Dialog contact remove confirmation -->
    <v-dialog v-model="dialogDeleteContact" persistent max-width="600px">
      <v-toolbar color="primary">
        <v-toolbar-title>
          Are you Sure you want to remove {{ contact.displayText }}?
        </v-toolbar-title>
        <v-spacer />
        <v-btn small fab outline @click="dialogDeleteContact = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <p>
            If you remove this contact from your address book, you will no longer be able to quickly look them up during
            operations and where applicable, the long form of their address will be used.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" flat @click="dialogDeleteContact = false">
            Cancel
          </v-btn>
          <v-btn color="blue darken-1" flat @click="deleteContact(contact)">
            Remove Contact
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import ContactEdit from '~/components/ContactEdit'
import WalletImage from '~/components/WalletImage'

export default {
  components: {ContactEdit, WalletImage },
  /**
   * DATA
   * @returns {{dialog: boolean, headers: *[], search: string}}
   */
  data() {
    return {
      displayText: '',
      contact: {},
      address: '',
      dialogEditContact: false,
      dialogDeleteContact: false,
      search: '',
      headers: [
        {
          text: 'Network',
          value: 'type'
        },
        {
          text: 'Name',
          value: 'displayText'
        },
        {
          text: 'Address',
          value: 'address'
        },
        {
          text: 'Actions',
          value: ''
        }
      ]
    }
  },
  /**
   * COMPUTED
   */
  computed: {
    contacts() {
      return Object.values(this.$store.state.wallet.contacts)
    }
  },
  /**
   * MOUNTED
   */
  mounted: function () {
    // Only start once global loading finished
    const preparationInterval = setInterval(
      function () {
        if (this.$store.getters.booting === false) {
          clearInterval(preparationInterval)
          this.$store.commit('setLoading', { t: 'router', v: false })
        }
      }.bind(this),
      this.$g('internal.controllerPollReadyInterval')
    )
  },
  /**
   * METHODS
   */
  methods: {
    deleteContact(contact) {
      this.$store.commit('wallet/deleteContact', contact)
      this.$store.commit('showNotification', {
        type: 'success',
        message: 'Contact Removed'
      })
      this.dialogDeleteContact = false
    },
    contactSaved() {
      this.$store.commit('showNotification', {
        type: 'success',
        message: 'Contact Saved'
      })
      this.dialogEditContact = false
    },
    editContact(contact) {
      this.address = contact.address
      this.dialogEditContact = true
    }
  }
}
</script>
