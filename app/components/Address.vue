<template>
  <span>

    <v-btn v-clipboard:copy="address" v-clipboard:success="onCopy" flat>
      <v-icon small>file_copy</v-icon>&nbsp;&nbsp;{{ displayText }}
    </v-btn>

    <!-- New transfer -->
    <v-dialog v-if="haveContact === false && showAdd === true" v-model="dialog" persistent max-width="600px">
      <v-btn slot="activator" icon outline>
        <v-icon>add</v-icon>
      </v-btn>
      <v-toolbar color="primary">
        <v-btn icon @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Add Contact</v-toolbar-title>
      </v-toolbar>
      <contact-edit :display-text="displayText" :address="address" @complete="contactAdded"/>
    </v-dialog>
  </span>
</template>

<script>
  import ContactEdit from "~/components/ContactEdit"
  export default {
    components: { ContactEdit },
    props: {
      address: {
        type: String,
        default: ""
      },
      showAdd: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        dialog: false
      };
    },
    computed: {
      haveContact() {
        if(this.$store.state.wallet.contacts.hasOwnProperty(this.address)) {
          return true
        } else {
          return false
        }
      },
      displayText() {
        if(this.haveContact) {
          return this.$store.state.wallet.contacts[this.address].displayText
        } else {
          return this.address
        }
      }
    },
    methods: {
      onCopy() {
        this.$store.commit("showNotification", {
          type: "success",
          message: "Copied"
        })
      },
      contactAdded() {
        this.$store.commit("showNotification", {
          type: "success",
          message: "Contact added to address book"
        })
        this.dialog = false
      }
    }
  };
</script>
