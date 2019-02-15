<template>
  <v-dialog v-model="dialogChallenge" persistent max-width="600px" class="blocking-overlay">
    <v-toolbar color="primary">
      <v-toolbar-title v-if="challengeType === 'global'">
        Global Challenge
      </v-toolbar-title>
      <v-toolbar-title v-else>
        {{ walletName }} Challenge
      </v-toolbar-title>
      <v-spacer />
      <v-btn small fab outline @click="cancelChallenge">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card>
      <v-card-text>
        <p>
          To proceed, please enter your password
        </p>
        <v-text-field
          v-model="password"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          @click:append="showPassword = !showPassword"
          @keyup.enter="submitChallenge"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" flat @click="cancelChallenge">
          Cancel
        </v-btn>
        <v-btn color="blue darken-1" flat @click="submitChallenge">
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

function initialDataState() {
  return {
    formValid: false,
    password: '',
    showPassword: false
  }
}
export default {
  data: function () { return initialDataState() },
  computed: {
    walletAddress() { return this.$store.state.security.walletAddress },
    walletName() {
      if(this.walletAddress !== '') {
        if(this.$store.state.wallet.wallets.hasOwnProperty(this.walletAddress)) {
          return this.$store.state.wallet.wallets[this.walletAddress].name
        }
      }
      return ''
    },
    challengeType: {
      get: function() { return this.$store.getters["security/challengeType"] },
      set: function(val) { this.$store.commit('security/setRequiredCheck', val) }
    },
    dialogChallenge() {
      if(this.$store.state.security.context.requiredCheck !== '' && this.$store.state.security.context.requiredCheck !== 'INVALID') {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    cancelChallenge() {
      this.$store.commit('security/cancelChallenge')
    },
    reset() {
      Object.assign(this.$data, initialDataState())
    },
    submitChallenge() {
      console.log('submitting the security challenge')
      this.$store.dispatch('security/checkPassword', this.password).then(() => {
        this.reset()
      })
        .catch((reason) => {
          console.log('failed auth because of: ' + reason)
          switch (reason) {
            case 'TOO_MANY_ATTEMPTS':
              this.$store.commit('showNotification', {
                type: 'error',
                message: 'Challenge failed. Used up too many tries'
              })
              break
            case 'INCORRECT_PASSWORD':
              this.$store.commit('showNotification', {
                type: 'error',
                message: 'Challenge failed. ' + (this.failLimit - this.failCount) + ' tries remaining'
              })
              break
          }
        })

    }
  }
}
</script>