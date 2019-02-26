<template>
  <v-dialog v-if="wallet" v-model="dialog" persistent max-width="400px" class="blocking-overlay">
    <v-toolbar color="primary">
      <v-toolbar-title>{{ $t('common.label.security') }}</v-toolbar-title>
      <v-spacer />
      <v-btn small fab outline @click="validity = 'CANCELLED'">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- user is cancelling the challenge -->
    <v-card v-if="validity === 'CANCELLED'">
      <v-card-text>
        <p>{{ $t('security.message.authenticate_cancel_question') }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" flat @click="validity = 'CHALLENGE'">
          {{ $t('security.action.password_enter') }}
        </v-btn>
        <v-btn color="blue darken-1" flat @click="appWipe">
          {{ $t('security.action.wipe_data') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Display challenge -->
    <v-card v-else>
      <v-card-text>

        <p>
          {{ wallet.name }}: {{ $t('security.message.authenticate_to_continue') }}
        </p>
        <v-text-field
          v-model="password"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          :type="showPassword ? 'text' : 'password'"
          :label="$t('common.label.password')"
          @click:append="showPassword = !showPassword"
          @keyup.enter="submitChallenge"
        />
        <v-alert v-if="message" :value="true">
          {{ message }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" flat @click="validity = 'CANCELLED'">
          {{ $t('common.action.cancel') }}
        </v-btn>
        <v-btn color="blue darken-1" flat @click="submitChallenge">
          {{ $t('common.action.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

function initialDataState() {
  return {
    message: null,
    password: '',
    showPassword: false
  }
}
export default {
  data: function () { return initialDataState() },
  computed: {
    wallet() {
      if(this.$store.state.security.context.address) {
        return this.$store.state.wallet.wallets[this.$store.state.security.context.address]
      }
      return null
    },
    challengeKey() { return this.$store.state.security.context.requiredCheck },
    validity: {
      get: function () {
        return this.$store.state.security.context.validity
      },
      set: function (val) {
        this.$store.commit('security/CONTEXT_PROPERTY', {key: 'validity', value: val })
      }
    },
    dialog() {
      if(this.$store.state.security.context.blocking === true) {
        if(this.validity !== 'VALID') { return true }
        return false
      } else {
        console.log('checking if dialog should be shown')
        console.log(this.validity.indexOf('VALID', 'CANCELLED'))
        if(['VALID', 'CANCELLED'].indexOf(this.validity) === -1) {
          return true
        }
        return false
      }
    }
  },
  methods: {
    appWipe() {
      console.log('reset all data here')
      this.$store.commit("reset")
      this.$store.commit("security/reset")
      this.$store.commit("wallet/reset")
      this.$nuxt.$router.replace({ path: '/' })
    },
    reset() {
      Object.assign(this.$data, initialDataState())
    },
    submitChallenge() {
      console.log('submitting the security challenge')
      this.$store.dispatch('security/checkPassword', this.password).then(() => {
        this.reset()
      })
        // Respond to reason for failure
        .catch((reason) => {
          switch (reason) {
            case 'LOCKED':
            case 'TOO_MANY_ATTEMPTS':
              this.message = 'Too Many Failed attempts. Wallet locked for ' + (this.$store.state.security.lockoutDuration / 1000) + 's'
              break
            case 'INCORRECT_PASSWORD':
              this.message = 'Incorrect password.'
              break
          }

          // Clear the message after a short time
          setTimeout(function() {
            console.log('clearing the message')
            this.message = null
          }.bind(this), 5000)
        })

    }
  }
}
</script>
