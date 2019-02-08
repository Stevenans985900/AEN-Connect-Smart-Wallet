<template>
  <v-dialog v-model="dialogChallenge" persistent fullscreen max-width="600px">
    <v-toolbar color="primary">

      <v-toolbar-title v-if="challengeType === 'global'">Main Password</v-toolbar-title>
      <v-toolbar-title v-else>Enter password for {{ walletName }}</v-toolbar-title>
      <v-spacer />
      <v-btn small fab outline @click="cancelChallenge">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card>
      <v-card-text>
        <v-text-field
          v-model="password"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          @click:append="showPassword = !showPassword"
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
export default {
  data() {
    return {
      password: '',
      showPassword: false,
      failCount: 0,
      failLimit: 3
    }
  },
  computed: {
    walletAddress() { return this.$store.state.security.walletAddress },
    walletName() {
      if(this.walletAddress !== '') {
        return this.$store.state.wallet.wallets[this.walletAddress].name
      }
      return ''
    },
    challengeType: {
      get: function() { return this.$store.getters["security/challengeType"] },
      set: function(val) { this.$store.commit('security/setRequiredCheck', val) }
    },
    dialogChallenge() {
      if(this.$store.state.security.requiredCheck !== '' && this.$store.state.security.requiredCheck !== 'INVALID') {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    cancelChallenge() {
      this.challengeType = 'INVALID'
    },
    submitChallenge() {
      let contextWallet
      if(this.challengeType === 'global') {
        contextWallet = this.$store.state.wallet.wallets[this.$store.state.wallet.aen.mainAddress]
      } else {
        contextWallet = this.$store.state.wallet.wallets[this.walletAddress]
      }

      if(contextWallet.password === this.password) {
        this.challengeType = ''
        this.failCount = 0
        console.log('passwords match')
      } else {
        this.failCount++
        if(this.failLimit <= this.failCount) {
          this.challengeType = 'INVALID'
          this.$store.commit('showNotification', {
            type: 'error',
            message: 'Challenge failed. Used up too many tries'
          })
        } else {
          this.$store.commit('showNotification', {
            type: 'error',
            message: 'Challenge failed. ' + (this.failLimit - this.failCount) + ' tries remaining'
          })
        }
      }
    }
  }
}
</script>