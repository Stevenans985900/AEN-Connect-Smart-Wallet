<template>
  <v-form ref="feedbackForm" v-model="formValid">
    <v-layout row wrap align-center justify-center>
      <v-flex xs12>
        <h3>{{ $t('feedback.label.type') }}</h3>
        <v-radio-group v-model="feedbackType">
          <v-radio :label="$t('common.label.comment')" value="comments" />
          <v-radio :label="$t('common.label.question')" value="questions" />
          <v-radio :label="$t('feedback.label.bug_report')" value="bug-reports" />
          <v-radio :label="$t('feedback.label.feature_request')" value="feature-request" />
        </v-radio-group>
      </v-flex>
      <v-flex xs12>
        <v-textarea
          v-model="feedbackMessage"
          outline
          :rules="[rules.basic.required, rules.feedbackMessage.minLength, rules.feedbackMessage.maxLength]"
          :label="$t('common.label.message')"
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="name"
          :label="$t('common.label.name')"
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="contactDetails"
          :label="$t('feedback.label.contact_information')"
        />
      </v-flex>
      <v-flex xs12>
        <v-btn :disabled="!formValid || disableContact" color="primary" @click="submit">
          {{ $t('common.action.send') }}
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
          maxLength: v => v.length <= 255 || this.$t('feedback.message.message_length_exceeded')
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
        this.$store.commit("BUSY", 'feedback.message.sending')

        axios.post(this.formUrl, {
          feedbackType: this.feedbackType,
          feedbackMessage: this.feedbackMessage,
          suggestionsForImprovement: this.suggestionsForImprovement,
          name: this.name,
          contactDetails: this.contactDetails
        })
          .then(function () {
            this.$store.commit("BUSY", false)
            this.$store.commit('showNotification', {
              type: 'success',
              message: this.$t('feedback.message.thank_you')
            })
          })
      }
    }
  }
</script>
