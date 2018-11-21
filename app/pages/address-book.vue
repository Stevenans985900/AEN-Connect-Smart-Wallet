<template>
  <v-layout justify-center align-center>

    <!-- New contact -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-btn slot="activator" color="primary" fixed fab bottom right>
        <v-icon>add</v-icon>
      </v-btn>
      <v-card>
        <v-card-title>
          <span class="headline">Contact</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6>
                <v-text-field v-model="contact.name" label="Name" required/>
              </v-flex>
              <v-flex xs12 sm6>
                <v-text-field v-model="contact.address" label="Blockchain Address"
                              hint="example: TCQS4NLATONNFT2SEY6Y3SZNQTMXF7O5K7TU7L7F"/>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Contacts table -->
    <v-flex xs12 sm8 md6>
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
        <v-data-table
          :headers="headers"
          :items="contacts"
          :search="search"
        >
          <template slot="items" slot-scope="props">
            <td>{{ props.item.name }}</td>
            <td class="text-xs-right">{{ props.item.address }}</td>
            <td class="justify-center layout px-0">
              <v-icon
                small
                class="mr-2"
                @click="editContact(props.item)"
              >
                edit
              </v-icon>
              <v-icon
                small
                @click="deleteContact(props.item)"
              >
                delete
              </v-icon>
            </td>
          </template>
          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-card>
    </v-flex>

  </v-layout>
</template>

<script>
	export default {
		data() {
			return {
				// Used to determine the outcome action after clicking the save button
				contact: {
					mode: 'new',
					name: '',
					address: ''
				},
				outcome: false,
				dialog: false,
				search: '',
				// This variable is used as a reference when editing a contact
				contextObject: {},
				headers: [
					{
						text: 'Name',
						value: 'name'
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
		computed: {
			contacts() {
				return this.$store.state.contacts
			}
		},
		created: function () {
			// Only start once global loading finished
			var preperationInterval = setInterval(function () {
				if (this.$store.getters.booting === false) {
					clearInterval(preperationInterval)
					this.$store.commit('setLoading', {'t': 'router', 'v': false})
				}
			}.bind(this), 2000)
		},
		methods: {
			save() {
				var message
				if (this.contact.mode === 'new') {
					// Check whether the object already exists
					if (this.$store.state.contacts.find(item => item.name === this.contact.name) === undefined) {
						message = 'Contact Added'
						this.$store.commit('showNotification', {'type': 'success', 'message': message})
						this.addContact()
						this.dialog = false
						this.contact.name = ''
						this.contact.address = ''
					} else {
						message = 'That name is already in use, please choose another'
						this.$store.commit('showNotification', {'type': 'error', 'message': message})
					}
				} else {
					this.editCommit()
					this.dialog = false
					this.contact.name = ''
					this.contact.address = ''
					this.contact.mode = 'new'

					message = 'Contact Edited'
					this.$store.commit('showNotification', {'type': 'success', 'message': message})
				}
			},
			addContact() {
				let contact = {
					name: this.contact.name,
					address: this.contact.address
				}
				this.$store.commit('addContact', contact)
				this.outcome = true
			},
			deleteContact(contact) {
				this.$store.commit('deleteContact', contact)
			},
			editContact(contact) {
				// Put the contact in to scope for simple editing
				this.contextObject = contact
				this.contact.name = contact.name
				this.contact.address = contact.address
				this.contact.mode = 'edit'
				// Show the modal
				this.dialog = true
			},
			editCommit() {
				let contact = {
					name: this.contact.name,
					address: this.contact.address
				}
				// Push to state management
				this.outcome = this.$store.commit('editContact', {
					original: this.contextObject,
					updated: contact
				})
				console.log(this.outcome)
			}
		}
	}
</script>