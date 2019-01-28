<template>
  <v-layout row justify-center align-center>

    <!-- Contacts table -->
    <v-flex xs12>
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
            <td>{{ props.item.displayText }}</td>
            <td class="text-xs-right">{{ props.item.address }}</td>
            <td class="justify-center layout px-0">
              <v-icon small class="mr-2" @click="editContact(props.item)">edit</v-icon>
              <v-icon small @click="deleteContact(props.item)">delete</v-icon>
            </td>
          </template>
          <v-alert
            slot="no-results"
            :value="true"
            color="error"
            icon="warning"
          >Your search for "{{ search }}" found no results.</v-alert>
        </v-data-table>
      </v-card>
    </v-flex>

    <!-- New contact -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-btn slot="activator" color="success" absolute fab bottom left>
        <v-icon>add</v-icon>
      </v-btn>
      <v-toolbar color="primary">
        <v-btn icon @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Add Contact</v-toolbar-title>
      </v-toolbar>
      <contact-edit @complete="contactAdded"/>
    </v-dialog>

  </v-layout>
</template>

<script>
export default {
  /**
   * DATA
   * @returns {{dialog: boolean, headers: *[], search: string}}
   */
  data() {
    return {
      dialog: false,
      search: "",
      headers: [
        {
          text: "Name",
          value: "name"
        },
        {
          text: "Address",
          value: "address"
        },
        {
          text: "Actions",
          value: ""
        }
      ]
    };
  },
  /**
   * COMPUTED
   */
  computed: {
    contacts() {
      return this.$store.state.wallet.contacts;
    }
  },
  /**
   * MOUNTED
   */
  mounted: function() {
    // Only start once global loading finished
    let preparationInterval = setInterval(
      function() {
        if (this.$store.getters.booting === false) {
          clearInterval(preparationInterval);
          this.$store.commit("setLoading", { t: "router", v: false });
        }
      }.bind(this),
      this.$g('internal.controllerPollReadyInterval')
    );
  },
  /**
   * METHODS
   */
  methods: {
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
