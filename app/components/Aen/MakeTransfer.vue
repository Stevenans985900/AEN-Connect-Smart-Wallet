<template>
  <!-- New transfer -->
  <v-card>
    <v-card-title>
      <span class="headline">Make a payment</span>
    </v-card-title>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex xs12 sm6>
            <v-combobox
                v-model="payee.address"
                :items="contacts"
                item-text="name"
                label="To"
                prepend-icon="contacts"
            />
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field
                v-model="payee.amount"
                label="Amount"
                suffix="XEM"/>
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field
                v-model="payee.message"
                label="Optional Message"/>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer/>
      <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
      <v-btn color="blue darken-1" flat @click="initiateTransfer">Initiate</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  export default {
    data() {
      payee: {
        address: '',
          amount: 0
      }
    }
  }
</script>