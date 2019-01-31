<template>
  <v-layout row justify-center align-center>
    <!-- Contacts table -->
    <v-flex xs12>
      <v-card>
        <v-btn
          color="success"
          absolute
          fab
          bottom
          left
          @click="dialogNewContact = true"
        >
          <v-icon>add</v-icon>
        </v-btn>
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
            <td>{{ props.item.displayText }}</td>
            <td>{{ props.item.network }}</td>
            <td class="text-xs-right">
              {{ props.item.address }}
            </td>
            <td class="justify-center layout px-0">
              <v-icon small class="mr-2" @click="editContact(props.item)">
                edit
              </v-icon>
              <v-icon small @click="deleteContact(props.item)">
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

    <!-- New contact -->
    <v-dialog v-model="dialogNewContact" persistent max-width="600px">
      <v-toolbar color="primary">
        <v-toolbar-title>Add Contact</v-toolbar-title>
        <v-spacer />
        <v-btn small fab outline @click="dialogNewContact = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <contact-edit :show-network="true" @complete="contactAdded" />
    </v-dialog>

    <!-- Edit contact -->
    <v-dialog v-model="dialogEditContact" persistent max-width="600px">
      <v-toolbar color="primary">
        <v-toolbar-title>Edit Contact</v-toolbar-title>
        <v-spacer />
        <v-btn small fab outline @click="dialogEditContact = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <contact-edit :show-network="true" :display-text="displayText" :address="address" @complete="contactEdited" />
    </v-dialog>

    <!-- Confirm contact removal -->
    <v-dialog
      v-model="dialogDeleteContact"
      max-width="500px"
    >
      <v-toolbar>
        <v-toolbar-title>Are you sure?</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text>
          Removing a contact will cause any references of it throughout the program to display the raw address and you
          won't be able to quickly find it again when performing wallet actions
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="green darken-1"
            flat="flat"
            @click="dialogDeleteContact = false"
          >
            No
          </v-btn>

          <v-btn
            color="green darken-1"
            flat="flat"
            @click="dialogDeleteContact"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import ContactEdit from '~/components/ContactEdit'
export default {
  components: { ContactEdit },
  /**
   * DATA
   * @returns {{dialog: boolean, headers: *[], search: string}}
   */
  data() {
    return {
      contact: '',
      displayText: '',
      address: '',
      dialogNewContact: false,
      dialogEditContact: false,
      dialogDeleteContact: false,
      search: '',
      headers: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Network',
          value: 'network'
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
    contactAdded() {
      this.$store.commit('showNotification', {
        type: 'success',
        message: 'Contact added to address book'
      })
      this.dialogNewContact = false
    },
    contactEdited() {
      this.$store.commit('showNotification', {
        type: 'success',
        message: 'Changes Saved'
      })
      this.dialogEditContact = false
    },
    deleteContact(contact) {
      if(this.dialogDeleteContact === false) {
        this.contact = contact
        this.dialogDeleteContact = true
      } else {
        this.$store.commit('wallet/deleteContact', contact)
        this.dialogDeleteContact = false
      }
    },
    editContact(contact) {
      console.log(contact)
      this.displayText = contact.displayText
      this.address = contact.address
      this.dialogEditContact = true
    }
  }
}
</script>
