<template>
  <v-layout row justify-center pa-2>
    <v-flex xs12>
      <!-- For selecting / adding security scopes -->
      <v-toolbar v-if="globalSecurityOnly === false">
        <v-toolbar-items>
          <v-menu offset-y>
            <v-btn
              v-if="Object.keys(walletsWithoutSecurity).length > 0"
              slot="activator"
              icon outline small
            >
              <v-icon>
                add
              </v-icon>
            </v-btn>
            <v-list>
              <v-list-tile
                v-for="(menuWallet, index) in walletsWithoutSecurity"
                :key="index"
                @click="addSecurityPolicy(menuWallet)"
              >
                <v-list-tile-title>{{ menuWallet.name }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <!-- Existing profile customisation -->
          <v-btn
            flat
            :class="{ 'info': isAddressActive('global') }"
            @click="walletAddress = 'global'"
          >
            {{ $t('common.label.default') }}
          </v-btn>
          <v-btn
            v-for="(security, contextWalletAddress) in walletsWithSecurity"
            :key="contextWalletAddress"
            flat
            :class="{ 'info': isAddressActive(contextWalletAddress) }"
            @click="walletAddress = contextWalletAddress"
          >
            {{ walletFromAddress(contextWalletAddress).name }}
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-layout row>
        <!-- Remove current security scope -->
        <v-btn
          v-if="walletAddress !== 'global'"
          @click="dialogRemovePreset = true"
        >
          {{ $t('common.action.remove') }}
        </v-btn>

        <!-- Select wizard templates -->
        <v-flex xs12 md3>
          <h3>
            {{ $t('common.label.wizard') }}
          </h3>
          <v-radio-group v-model="securityLevel">
            <v-radio
              v-for="(options, index) in securityLevels"
              :key="index"
              :label="index"
              :value="index"
            />
            <v-radio label="Custom" value="custom" />
          </v-radio-group>
        </v-flex>
        <v-flex xs12 md9>
          <h3>
            {{ $t('common.label.features') }}
          </h3>
          <!-- Global only options -->
          <v-checkbox v-if="walletAddress === 'global'" v-model="app_start" :label="$t('security.label.password_app_start')" />
          <!-- Wallet specific options -->
          <v-checkbox v-model="transaction_start" :label="$t('security.label.password_transaction_start')" />
          <v-checkbox v-model="wallet_open" :label="$t('security.label.password_wallet_open')" />
        </v-flex>
      </v-layout>
    </v-flex>

    <!-- Remove Wallet Dialog -->
    <v-dialog v-if="dialogRemovePreset" v-model="dialogRemovePreset" persistent max-width="600px">
      <v-toolbar color="primary">
        <v-toolbar-title>{{ $t('common.message.are_you_sure') }}</v-toolbar-title>
        <v-spacer />
        <v-btn small icon outline @click="dialogRemovePreset = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-title class="headline">
          {{ walletFromAddress(walletAddress).name }}
        </v-card-title>
        <v-card-text>
          <p>{{ $t('security.message.profile_remove_confirmation') }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" flat @click="dialogRemovePreset = false">
            {{ $t('common.action.cancel') }}
          </v-btn>
          <v-btn color="blue darken-1" flat @click="removePreset">
            {{ $t('common.action.remove') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  props: {
    globalSecurityOnly: {
      type: Boolean,
      default: true
    },
    inputWalletAddress: {
      type: String,
      default: 'global'
    }
  },
  data() {
    return {
      walletAddress: '',
      dialogNewSecurityPolicy: false,
      dialogRemovePreset: false,
      securityLevels: {
        'high': {
          policy: {
            app_start: true,
            transaction_start: true,
            wallet_open: true
          }
        },
        'normal': {
          policy: {
            app_start: true,
            transaction_start: true,
            wallet_open: false
          }
        }
      }
    }
  },
  computed: {
    walletsWithoutSecurity() {
      let wallets = {}
      for (let wallet in this.$store.state.wallet.wallets) {
        if(!this.$store.state.security.walletPolicies.hasOwnProperty(wallet)) {
          wallets[wallet] = this.$store.state.wallet.wallets[wallet]
        }
      }
      return wallets
    },
    walletsWithSecurity() {
      return this.$store.state.security.walletPolicies
    },
    securityLevel: {
      get: function() {
        if(this.walletAddress === 'global') {
          return this.$store.state.security.securityLevel
        } else {
          // Try to get the property from state
          try {
            return this.$store.state.security.walletPolicies[this.walletAddress].securityLevel
          } catch (e) {
            return this.$store.state.security.globalPolicy.securityLevel
          }
        }
      },
      set: function(inputLevel) {

        if(inputLevel !== 'custom') {
          let policy = this.securityLevels[inputLevel].policy
          if(this.walletAddress === 'global') {
            this.$store.commit('security/setGlobalSecurityLevel', inputLevel)
            this.$store.commit('security/setGlobalPolicy', policy)
          } else {
            this.$store.commit('security/setWalletPolicy', {
              walletAddress: this.walletAddress,
              policy: policy
            })
            this.$store.commit('security/setWalletPolicyProperty', {
              walletAddress: this.walletAddress,
              key: 'securityLevel',
              value: inputLevel
            })
          }
        }
      }
    },
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

        this.$store.commit('security/setGlobalPolicyProperty', {
          key: 'app_start',
          value: val
        })
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
          this.$store.commit('security/setGlobalSecurityLevel', 'custom')
          this.$store.commit('security/setGlobalPolicyProperty', {
            key: 'transaction_start',
            value: val
          })
        } else {
          this.$store.commit('security/setWalletPolicyProperty', {
            walletAddress: this.walletAddress,
            key: 'securityLevel',
            value: 'custom'
          })
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
          this.$store.commit('security/setGlobalSecurityLevel', 'custom')
          this.$store.commit('security/setGlobalPolicyProperty', {
            key: 'wallet_open',
            value: val
          })
        } else {
          this.$store.commit('security/setWalletPolicyProperty', {
            walletAddress: this.walletAddress,
            key: 'securityLevel',
            value: 'custom'
          })
          this.$store.commit('security/setWalletPolicyProperty', {
            walletAddress: this.walletAddress,
            key: 'wallet_open',
            value: val
          })
        }
      }
    },
    wallets: function() { return this.$store.state.wallet.wallets }
  },
  watch: {
    inputWalletAddress: function (val) {
      this.walletAddress = val
    }
  },
  mounted: function () {
    this.walletAddress = this.inputWalletAddress
  },
  methods: {
    isAddressActive(address) {
      if(address === this.walletAddress) { return true }
    },
    /**
     *
     */
    removePreset() {
      const addressToDelete = this.walletAddress
      this.walletAddress = 'global'
      this.dialogRemovePreset = false
      this.$store.commit('security/removeWalletPolicy', addressToDelete)
    },
    addSecurityPolicy(wallet) {
      this.$store.commit('security/setWalletPolicy', {
        walletAddress:  wallet.address,
        policy: this.$store.state.security.globalPolicy
      })
      this.$store.commit('security/setWalletPolicyProperty', {
        walletAddress: wallet.address,
        key: 'securityLevel',
        value: this.$store.state.security.securityLevel
      })
      // Set the context to the wallet
      this.walletAddress = wallet.address
    },
    walletFromAddress(address) {
      return this.$store.state.wallet.wallets[address]
    }
  }
}
</script>
