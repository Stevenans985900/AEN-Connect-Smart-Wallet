<template>
  <v-layout row justify-center>
    <v-flex v-if="globalSecurityOnly === false" xs12 md3>
      Wallet selection here
    </v-flex>
    <v-flex :class="securityControlsGrid">
      <v-layout row>
        <v-flex xs6 sm3>
          <v-card flat>
            <v-card-title>Premade level</v-card-title>
            <v-card-text>
              <v-radio-group v-model="securityLevel">
                <v-radio
                  v-for="(options, index) in securityLevels"
                  :key="index"
                  :label="index"
                  :value="index"
                />
              </v-radio-group>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs6 sm9>
          <v-card flat>
            <v-card-title>Security Features enabled</v-card-title>
            <v-card-text>
              <v-checkbox v-model="app_start" label="Password on App Start. Main AENC wallet password" />
              <v-checkbox v-model="transaction_start" label="Password on Transaction. Operational wallet password" />
              <v-checkbox v-model="wallet_open" label="Password on wallet. Operational wallet password" />
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: {
    globalSecurityOnly: {
      type: Boolean,
      default: false
    },
    walletAddress: {
      type: String,
      default: 'global'
    }
  },
  data() {
    return {
      securityLevel: 'medium',
      securityLevels: {
        'high': {
          description: "Maximum Challenges",
          policy: {
            app_start: true,
            transaction_start: true,
            wallet_open: true
          }
        },
        'medium': {
          description: "Modest controls",
          policy: {
            app_start: true,
            transaction_start: true,
            wallet_open: false
          }
        },
        'low': {
          description: "Minimum safety controls. Only to be used on trusted device",
          policy: {
            app_start: true,
            transaction_start: false,
            wallet_open: false
          }
        }
      }
    }
  },
  computed: {
    securityControlsGrid() {
      if(this.globalSecurityOnly === false) {
        return 'md9'
      } else {
        return 'md12'
      }
    },
    app_start: {
      get: function() {
        if(this.walletAddress === 'global') {
          return this.$store.state.security.globalPolicy.app_start
        } else {
          // Try to get the property from state
          try {
            return this.$store.state.security.walletPolicies[this.walletAddress].app_start
          } catch (e) {
            return false
          }
        }
      },
      set: function(val) {
        if(this.walletAddress === 'global') {
          this.$store.commit('security/setGlobalPolicyProperty', {
            key: 'app_start',
            value: val
          })
        } else {
          this.$store.commit('security/setWalletPolicyProperty', {
            walletAddress: this.walletAddress,
            key: 'app_start',
            value: val
          })
        }
      }
    },
    transaction_start: {
      get: function() {
        if(this.walletAddress === 'global') {
          return this.$store.state.security.globalPolicy.transaction_start
        } else {
          // Try to get the property from state
          try {
            return this.$store.state.security.walletPolicies[this.walletAddress].transaction_start
          } catch (e) {
            return false
          }
        }
      },
      set: function(val) {
        if(this.walletAddress === 'global') {
          this.$store.commit('security/setGlobalPolicyProperty', {
            key: 'transaction_start',
            value: val
          })
        } else {
          this.$store.commit('security/setWalletPolicyProperty', {
            walletAddress: this.walletAddress,
            key: 'transaction_start',
            value: val
          })
        }
      }
    },
    wallet_open: {
      get: function() {
        if(this.walletAddress === 'global') {
          return this.$store.state.security.globalPolicy.wallet_open
        } else {
          // Try to get the property from state
          try {
            return this.$store.state.security.walletPolicies[this.walletAddress].wallet_open
          } catch (e) {
            return false
          }
        }
      },
      set: function(val) {
        if(this.walletAddress === 'global') {
          this.$store.commit('security/setGlobalPolicyProperty', {
            key: 'wallet_open',
            value: val
          })
        } else {
          this.$store.commit('security/setWalletPolicyProperty', {
            walletAddress: this.walletAddress,
            key: 'wallet_open',
            value: val
          })
        }
      }
    }
  },
  watch: {
    securityLevel: function(selected) {
      const policy = this.securityLevels[selected].policy
      if(this.walletAddress === 'global') {
        this.$store.commit('security/setGlobalPolicy', policy)
      } else {
        this.$store.commit('security/setWalletPolicy', {
          walletAddress: this.walletAddress,
          policy: policy
        })
      }
    }
  }
}
</script>