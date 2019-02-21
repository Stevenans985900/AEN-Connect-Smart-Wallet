<template>
  <v-form ref="feedbackForm" v-model="formValid">
    <v-layout row wrap align-center justify-center>
      <v-flex xs12>
        <h3>Feedback Type</h3>
        <v-radio-group v-model="feedbackType">
          <v-radio label="Comments" value="comments" />
          <v-radio label="Questions" value="questions" />
          <v-radio label="Bug Reports" value="bug-reports" />
          <v-radio label="Feature Request" value="feature-request" />
        </v-radio-group>
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="feedbackMessage"
          :rules="[rules.basic.required, rules.feedbackMessage.minLength, rules.feedbackMessage.maxLength]"
          label="Feedback"
          required
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="name"
          label="Name"
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="contactDetails"
          label="Contact Information"
          placeholder="If you'd like us to get in contact with you, please provide details"
        />
      </v-flex>
      <v-flex xs12>
        <v-btn :disabled="!formValid || disableContact" color="primary" @click="submit">
          Submit Message
        </v-btn>
      </v-flex>
    </v-layout>
  </v-form>
</template>

<script>
  import axios from 'axios'

  function initialDataState() {
    return {
      formUrl: 'https://script.google.com/macros/s/AKfycbwfg8TDofiyO3L5x0iF9r0lfLGaXF1g8S3VMt6LvqoywLoHziTK/exec',
      formValid: false,
      feedbackType: '',
      feedbackMessage: '',
      suggestionsForImprovement: '',
      name: '',
      contactDetails: '',
      disableContact: false,
      rules: {
        basic: {
          required: value => !!value || 'Required.'
        },
        feedbackMessage: {
          minLength: v => v.length >= 4 || 'Min 4 Characters',
          maxLength: v => v.length <= 255 || 'Max 255 Characters. If you have so much to say, we\'d love to chat with you directly!'
        }
      }
    }
  }
  export default {
    data() { return initialDataState() },
    methods: {
      submit() {
        if (!this.$refs.feedbackForm.validate()) {
          return false
        }
        this.$store.commit("setLoading", { t: "page", v: true })

        axios.post(this.formUrl, {
          feedbackType: this.feedbackType,
          feedbackMessage: this.feedbackMessage,
          suggestionsForImprovement: this.suggestionsForImprovement,
          name: this.name,
          contactDetails: this.contactDetails
        })
          .then(function () {
            this.$store.commit("setLoading", { t: "page", v: false })
            this.$store.commit('showNotification', {
              type: 'success',
              message: 'Thank you for your message'
            })
          })
          .catch(function (error) {
            console.log('something went wrong when submitting the form')
            console.log(error)
          })
      }
    }
  }
</script>
