<template>
  <span>
    {{ contact.name }}
    <!-- New transfer -->
    <v-dialog v-model="dialog" v-if="missing" persistent max-width="600px">
        <v-btn slot="activator" icon outline>
            <v-icon>add</v-icon>
        </v-btn>
        <v-card>
            <v-card-title>
                <span class="headline">Add Contact</span>
            </v-card-title>
            <v-card-text>
            <v-container grid-list-md>
                <v-layout wrap>
                <v-flex xs12 sm6>
                        <v-text-field
                        label="Name"
                        v-model="contact.name"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                    <v-text-field
                        label="Blockchain Address"
                        v-model="contact.address"></v-text-field>
                </v-flex>
                </v-layout>
            </v-container>
            </v-card-text>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
            <v-btn color="blue darken-1" flat @click="addContact">Add</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </span>
</template>

<style scoped>
  button.v-btn {
    height: 18px;
    width: 18px;
  }
  .v-icon {
    font-size: 16px;
  }
</style>

<script>
export default {
	data () {
		return {
			contact: {
				name: '',
				address: ''
			},
			missing: true,
			dialog: false
		}
	},
	props: {
		address: String
	},
	created: function () {
		this.contact.address = this.address

		var result = this.$store.state.contacts.find(contact => {
			return contact.address === this.address
		})
		if (!result) {
			this.contact.name = this.address
		} else {
			this.contact.name = result.name
		}
	},
	methods: {
		addContact () {
			this.$store.commit('addContact', this.contact)
			var message = 'Contact added to address book'
			this.$store.commit('showNotification', { 'type': 'success', 'message': message })
			this.dialog = false
		}
	}
}
</script>
