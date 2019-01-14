<template>
  <span>
    <v-btn v-clipboard:copy="address" v-clipboard:success="onCopy" flat>
      <v-icon
        small
      >
        file_copy
      </v-icon>&nbsp;&nbsp;{{ displayText }}
    </v-btn>

    <!-- New transfer -->
    <v-dialog v-if="missing === true && showAdd === true" v-model="dialog" persistent max-width="600px">
      <v-btn slot="activator" icon outline>
        <v-icon>add</v-icon>
      </v-btn>
      <v-card>
        <v-card-title>
          <span class="headline">
            Add Contact
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6>
                <v-text-field
                  v-model="displayText"
                  label="Name"
                />
              </v-flex>
              <v-flex xs12 sm6>
                <v-text-field
                  v-model="address"
                  label="Blockchain Address"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn class="smaller" color="blue darken-1" flat @click.native="dialog = false">
            Close
          </v-btn>
          <v-btn class="smaller" color="blue darken-1" flat @click="addContact">
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<style scoped>
  button.smaller {
    height: 18px;
    width: 18px;
  }

  .v-icon.smaller {
    font-size: 16px;
  }
</style>

<script>
  export default {
    props: {
      address: {
        type: String,
        default: ""
      },
      showAdd: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data() {
      return {
        displayText: "",
        missing: true,
        dialog: false
      };
    },
    watch: {
      address: function() {
        this.renderAddress();
      }
    },
    created: function() {
      this.renderAddress()
    },
    methods: {
      renderAddress() {
        var result = this.$store.state.wallet.contacts.find(contact => {
          return contact.address === this.address;
        });

        if (result) {
          this.missing = false;
          this.displayText = result.displayText;
        } else {
          this.displayText = this.address;
        }
      },
      onCopy() {
        var message = "Copied to clipboard";
        this.$store.commit("showNotification", { "type": "error", "message": message });
      },
      addContact() {
        this.$store.commit("wallet/addContact", {
          'displayText': this.displayText,
          'address': this.address
        });
        var message = "Contact added to address book";
        this.$store.commit("showNotification", { "type": "success", "message": message });
        this.dialog = false;
      }
    }
  };
</script>
