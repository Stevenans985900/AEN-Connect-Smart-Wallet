<template>
  <v-container>
    <v-layout row justify-center align-center>
      <!-- Security Options -->
      <v-flex xs12 md12>
        <v-card>
          <v-card-title>
            <h1>
              Security Options
            </h1>
          </v-card-title>
          <v-card-text>
            <security-controls />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <v-layout row>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <h1>
              Change Master Password
            </h1>
          </v-card-title>
          <v-card-text>
            <p>
              The master password is used to authenticate a user for access to the entire Smart Wallet app. By default,
              it is set to the same password as your initial AEN Wallet.
            </p>
            <v-text-field
              v-model="existingPassword"
              :append-icon="showPassword ? 'visibility_off' : 'visibility'"
              :type="showPassword ? 'text' : 'password'"
              :rules="[rules.basic.required, rules.password.minLength]"
              label="Existing Password"
              required
              @click:append="showPassword = !showPassword"
            />
            <v-text-field
              v-model="password1"
              :append-icon="showPassword ? 'visibility_off' : 'visibility'"
              :type="showPassword ? 'text' : 'password'"
              :rules="[rules.basic.required, rules.password.minLength]"
              label="New Password"
              required
              counter
              @click:append="showPassword = !showPassword"
            />
            <v-text-field
              v-model="password2"
              :append-icon="showPassword ? 'visibility_off' : 'visibility'"
              :type="showPassword ? 'text' : 'password'"
              :rules="[rules.basic.required, rules.password.minLength]"
              label="Repeat Password"
              :error-messages="passwordsMatch()"
              required
              counter
              @click:append="showPassword = !showPassword"
            />
            <v-btn @click="changePassword" />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import SecurityControls from '~/components/SecurityControls'
export default {
  components: {
    SecurityControls
  },
  /**
   * DATA
   * @returns {{dialog: boolean, headers: *[], search: string}}
   */
  data() {
    return {
      existingPassword: false,
      password1: '',
      password2: '',
      showPassword: false,
      rules: {
        basic: {
          required: value => !!value || 'Required.'
        },
        password: {
          minLength: v => v.length >= 8 || 'Min 8 characters'
        }
      }
    }
  },
  computed: {
    aenWallets() {
      return Object.values(this.$store.getters['wallet/walletsByType']('aen'))
    },
    mainAenWallet: {
      get: function () { return this.$store.state.wallet.aen.mainAddress },
      set: function (val) {
        this.$store.commit('wallet/setAenProperty', {
          key: 'mainAddress',
          value: val
        })
      }
    }
  },
  /**
   * MOUNTED
   */
  mounted: function () {
    // Only start once global loading finished
    const preparationInterval = setInterval(
      function () {
        if (this.$store.getters.booting === false) {
          clearInterval(preparationInterval)
          this.$store.commit('setLoading', { t: 'router', v: false })
        }
      }.bind(this),
      this.$g('internal.controllerPollReadyInterval')
    )
  },
  methods: {
    /**
     * Facade handler for picking up password reset request
     */
    changePassword() {

      // Check whether the existing password matches records
      console.log(this.passwordsMatch())
      // Check that the two passwords match just in case validation failed
      // Update the state variable for the password change
    },
    passwordsMatch() {
      return (this.password1 === this.password2) ? '' : 'Passwords must match'
    }
  }
}
</script>
