<template>
  <v-card>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex xs12 sm6>
            <v-text-field v-model="inputDisplayText" label="Name" required/>
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field
              :readonly="readOnly"
              v-model="inputAddress"
              label="Blockchain Address"
              hint="example: TCQS4NLATONNFT2SEY6Y3SZNQTMXF7O5K7TU7L7F"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer/>
      <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  export default {
    props: {
      displayText: {
        type: String,
        default: ""
      },
      address: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        inputDisplayText: "",
        inputAddress: "",
        readOnly: false
      };
    },
    mounted() {
      if(this.address !== '') {
        this.inputAddress = this.address
        this.readOnly = true
      }
      if(this.displayText !== '') {
        this.inputDisplayText = this.displayText
      }
    },
    methods: {
      save() {
        this.$store.commit("wallet/setContact", {
          'displayText': this.inputDisplayText,
          'address': this.inputAddress
        })
        this.$emit('complete')
      }
    }
  };
</script>