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
        <v-list-tile @click="dialogDeployContract= true">
          <v-list-tile-title>Deploy test contract</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="dialogSecurity = true">
          <v-list-tile-title>Security</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-dialog v-if="dialogDeployContract" v-model="dialogDeployContract">
      <v-toolbar color="primary">
        <v-toolbar-title>Deploy Test Contract to Ethereum wallet</v-toolbar-title>
        <v-spacer />
        <v-btn small icon outline @click="dialogDeployContract = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <v-layout row wrap>
            <v-flex xs12>
              {{ debug }}
              <v-select
                v-model="wallet"
                :items="ethereumWallets"
                return-object
                item-text="name"
                label="Select an Ethereum wallet to deploy the contract from"
              />
            </v-flex>
            <v-flex xs12>
              <v-btn :disabled="busy == true" color="blue darken-1" flat @click="deployTestContract">
                Deploy Test Contract
              </v-btn>
              <v-btn v-if="busy == true" flat disabled>
                <v-progress-circular
                  indeterminate
                ></v-progress-circular>
                {{ $t('network.message.broadcasting_please_wait') }}
              </v-btn>

            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-if="dialogSecurity" v-model="dialogSecurity" fullscreen>
      <v-toolbar color="primary">
        <v-btn small icon outline @click="dialogSecurity = false">
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
        <v-btn small icon outline @click="dialogWalletControl = false">
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
import { mapGetters } from 'vuex'
export default {
  components: { Balance },
  /**
     * DATA
     */
  data() {
    return {
      debug: null,
      walletAddress: 'global',
      wallet: null,
      dialogDeployContract: false,
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
    ...mapGetters([
      'busy'
    ]),
    ethereumWallets() {
      return this.$store.getters['wallet/walletsByType']('eth')
    },
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
    deployTestContract() {
      console.debug('Development: Deploying test contract')
      import('~/class/network/contract/test.json').then((jsonInterface) => {
        const web3 = this.$store.getters["wallet/networkHandler"]("contract").web3
        const apiEndpoint = this.$store.state.wallet.eth.activeApiEndpoint
            .replace('###NETWORK_IDENTIFIER###', this.wallet.network.identifier)
        web3.setProvider(apiEndpoint)
        this.$store.dispatch('security/getCredentials', this.wallet.address).then((credentials) => {
          this.$store.commit('setLoading', {
            t: 'page',
            v: true,
            m: 'development.label.deploy_contract'
          })

          web3.eth.estimateGas({
            from: this.wallet.address,
            data: jsonInterface.bin
          })
            .then((gas) => {
              web3.eth.accounts.signTransaction({
                from: this.wallet.address,
                gas: gas,
                gasPrice:  50000000000,
                data: jsonInterface.bin
              }, credentials.privateKey)
                .then((signedTx) => {
                  web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                    .then(() => {
                        this.$store.commit('setLoading', {
                          t: 'page',
                          v: false })
                        console.debug('Contract has been pushed out to the network')
                      this.dialogDeployContract = false
                    })
                })
                .catch((err) => {
                  console.log('something went wrong when sending a transaction')
                  console.error(err)
                })
            })
        })
      })
    },
    removeSecurityPolicy(wallet) {
      console.log('removing wallet policy')
      console.log(wallet)
    },
    simpleSleep() { return new Promise(resolve => setTimeout(resolve, 3000))},
    async waitContract(contract) {
      const web3 = this.$store.getters["wallet/networkHandler"]("contract").web3
      const truthy = true
      while (truthy) {
        let receipt = web3.eth.getTransactionReceipt(contract.transactionHash);
        if (receipt && receipt.contractAddress) {
          console.log("Your contract has been deployed at http://testnet.etherscan.io/address/" + receipt.contractAddress);
          console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io");
          break;
        }
        console.log("Waiting a mined block to include your contract... currently in block " + web3.eth.blockNumber);
        await this.simpleSleep(4000);
      }
    },
    switchOnChainStatus(wallet) {
      const newCondition = !wallet.onChain
      this.$store.commit('wallet/setWalletProperty', {
        address: wallet.address,
        key: 'onChain',
        value: newCondition
      })
    }
  }
}
</script>
