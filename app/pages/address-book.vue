<template>
  <v-container>
    <v-layout row justify-center align-center>
      <!-- Contacts table -->
      <v-flex xs12>
        <v-toolbar class="primary mb-2">
          <v-toolbar-title>
            {{ $t('common.navigation.address_book') }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn color="success" @click="dialogEditContact = true; address = ''">
            <v-icon>add</v-icon>{{ $t('contact.action.add') }}
          </v-btn>
        </v-toolbar>
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="search"
              :label="$t('common.label.search')"
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
                <v-btn outline small @click="editContact(props.item)">
                  {{ $t('common.action.edit') }}
                </v-btn>
                <v-btn outline small @click="dialogDeleteContact = true;contact = props.item">
                  {{ $t('common.action.remove') }}
                </v-btn>
              </td>
            </template>
            <v-alert
              slot="no-results"
              :value="true"
              color="error"
              icon="warning"
            >
              {{ $t('common.message.results_empty') }}
            </v-alert>
          </v-data-table>
        </v-card>
      </v-flex>

      <!-- Dialog contact edit form -->
      <v-dialog v-model="dialogEditContact" persistent max-width="600px">
        <v-toolbar color="primary">
          <v-toolbar-title>
            {{ $t('contact.label.contact') }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn small icon outline @click="dialogEditContact = false; address = ''">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <contact-edit :address="address" @complete="contactSaved" />
      </v-dialog>

      <!-- Dialog contact remove confirmation -->
      <v-dialog v-model="dialogDeleteContact" persistent max-width="600px">
        <v-toolbar color="primary">
          <v-toolbar-title>
            {{ $t('common.message.are_you_sure') }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn small icon outline @click="dialogDeleteContact = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card>
          <v-card-text>
            <span>
              {{ $t('contact.chunk.removal_warning') }}
            </span>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" flat @click="dialogDeleteContact = false">
              {{ $t('common.action.cancel') }}
            </v-btn>
            <v-btn color="blue darken-1" flat @click="deleteContact(contact)">
              {{ $t('common.action.confirm') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import ContactEdit from '~/components/ContactEdit'
import WalletImage from '~/components/WalletImage'

function initialDataState() {
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
}
export default {
  components: {ContactEdit, WalletImage },
  /**
   * DATA
   * @returns {{dialog: boolean, headers: *[], search: string}}
   */
  data() { return initialDataState() },
  head() {
    return {
      title: 'AENConnect Smart Wallet - Address Book',
      meta: [
        { hid: 'description', name: 'description', content: 'The address book makes remembering all those addresses a breeze!' }
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
      this.$store.state.time_definitions.controller_poll
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
