<template>
  <span>
    <v-menu offset-y>
      <v-btn slot="activator" color="primary">
        Development
      </v-btn>
      <v-list>
        <v-list-tile @click="dialogWalletControl = true">
          <v-list-tile-title>Wallet Control</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="dialogSecurity = true">
          <v-list-tile-title>Security</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-dialog v-if="dialogSecurity" v-model="dialogSecurity" fullscreen>
      <v-toolbar color="primary">
        <v-btn small fab outline @click="dialogSecurity = false">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <v-toolbar-title>Security Controls</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <h1>
            Global
          </h1>
          <v-checkbox v-model="app_start" label="Password on App Start. Main AENC wallet password" />
          <!-- Wallet specific options -->
          <v-checkbox v-model="transaction_start" label="Password on Transaction" />
          <v-checkbox v-model="wallet_open" label="Password on wallet" />
          <h1>
            Individual Wallet Policies
          </h1>
          <v-flex xs12 for="wallet in walletsWithSecurity">
            <v-btn @click="removeSecurityPolicy(wallet)">
              {{ wallet }}
            </v-btn>
          </v-flex>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-if="dialogWalletControl" v-model="dialogWalletControl" fullscreen>
      <v-toolbar color="primary">
        <v-btn small fab outline @click="dialogWalletControl = false">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <v-toolbar-title>Wallet Development Controls</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-btn
          color="success"
          absolute
          fab
          bottom
          left
          @click="dialogNewContact = true"
        >
          <v-icon>add</v-icon>
        </v-btn>
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          />
        </v-card-title>
        <v-data-table :headers="headers" :items="wallets" :search="search">
          <template slot="items" slot-scope="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.address }}</td>
            <td><balance :wallet="props.item" /></td>
            <td>{{ props.item.onChain }}</td>
            <td>{{ props.item.type }}</td>
            <td class="justify-center layout px-0">
              <v-btn small class="mr-2" @click="switchOnChainStatus(props.item)">
                Switch onChain Status
              </v-btn>
              <v-icon small @click="deleteContact(props.item)">
                delete
              </v-icon>
            </td>
          </template>
          <v-alert
            slot="no-results"
            :value="true"
            color="error"
            icon="warning"
          >
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import Balance from '~/components/Balance'
export default {
  components: { Balance },
  /**
     * DATA
     */
  data() {
    return {
      walletAddress: 'global',
      dialogWalletControl: false,
      dialogSecurity: false,
      search: '',
      headers: [
        {
          text: 'Wallet Name',
          value: 'name'
        },
        {
          text: 'Address',
          value: 'address'
        },
        {
          text: 'Balance',
          value: ''
        },
        {
          text: 'onChain',
          value: 'onChain'
        },
        {
          text: 'Type',
          value: 'type'
        },
        {
          text: 'Actions',
          value: ''
        }
      ]
    }
  },
  /**
     * COMPUTED
     */
  computed: {
    walletsWithSecurity() {
      return this.$store.state.security.walletPolicies
    },
    wallets() { return Object.values(this.$store.state.wallet.wallets) },
    globalSecurity() { return this.$store.state.security.globalPolicy },
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
            this.$store.commit('security/setWalletSecurityLevel', inputLevel)
            this.$store.commit('security/setWalletPolicy', {
              walletAddress: this.walletAddress,
              policy: policy
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
          this.$store.commit('security/setWalletSecurityLevel', {
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
          this.$store.commit('security/setWalletSecurityLevel', {
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
    }
  },
  /**
     * METHODS
     */
  methods: {
    removeSecurityPolicy(wallet) {
      console.log('removing wallet policy')
      console.log(wallet)
    },
    switchOnChainStatus(wallet) {
      const newCondition = !wallet.onChain
      this.$store.commit('wallet/setWalletProperty', {
        wallet: wallet,
        key: 'onChain',
        value: newCondition
      })
    }
  }
}
</script>
