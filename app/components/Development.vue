<template>
  <span>
    <v-menu offset-y>
      <v-btn slot="activator" small icon>
        <v-icon>
          build
        </v-icon>
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
                />
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
            <td>
              <v-btn small class="mr-2" @click="switchOnChainStatus(props.item)">
                {{ props.item.onChain }}
              </v-btn>
            </td>
            <td>{{ props.item.type }}</td>
            <td v-if="props.item.type === 'aen'">
              <v-btn small class="mr-2" @click="switchMainAenStatus(props.item)">
                {{ (props.item.address === mainAenAddress ? "Main" : "Sub") }}
              </v-btn>
            </td>
            <td v-else>
              NA
            </td>
            <td class="justify-center layout px-0">
              <v-icon small>
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
import EthereumTx from 'ethereumjs-tx'
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
          text: 'Main',
          value: ''
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
    mainAenAddress: {
      get: function() { return this.$store.state.wallet.aen.mainAddress },
      set: function(val) { this.$store.commit('wallet/setAenProperty', {key: 'mainAddress', value: val } )}
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
    async deployTestContract() {
      this.$log.debug('Deploy Test Contract', this.wallet)
      const jsonInterface = await import('~/class/network/contract/test.json')
      const web3 = this.$store.getters["wallet/networkHandler"]("contract").web3
      const apiEndpoint = this.$store.state.wallet.eth.activeApiEndpoint
          .replace('###NETWORK_IDENTIFIER###', this.wallet.network.identifier)
      web3.setProvider(apiEndpoint)

      this.$log.debug(this.wallet, ('Sending to: ' + apiEndpoint))

      const credentials = await this.$store.getters['security/walletProps'](this.wallet.address)
      const privateKey = Buffer.from(credentials.privateKey.substring(2), 'hex')
      console.log(credentials)

      this.$store.dispatch('busy', 'development.label.deploy_contract')
      const gas = await web3.eth.estimateGas({from: this.wallet.address, data: jsonInterface.bin})
      console.log('gas', gas)
      const nonce = await web3.eth.getTransactionCount(this.wallet.address, 'pending')
      console.log('nonce', web3.utils.toHex(nonce))

      const txParams = {
        nonce: web3.utils.toHex(nonce),
        gasPrice: web3.utils.toHex(Math.floor(gas * 1.5)),
        gas: web3.utils.toHex(gas),
        gasLimit: web3.utils.toHex(Math.floor(gas * 1.2)),
        from: this.wallet.address,
        data: jsonInterface.bin,
        chainId: 3
      }
      const tx = new EthereumTx(txParams)
      tx.sign(privateKey)
      const serializedTx = tx.serialize()
      web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'))
        .on('transactionHash', function(transactionHash){
          console.debug('Transaction receipt from wire', transactionHash)
          this.waitContract(transactionHash)
          this.$store.dispatch('busy', false)
          this.dialogDeployContract = false
          return transactionHash
        }.bind(this))
        .on('error', function(err){ console.error(err) })

    },
    removeSecurityPolicy(wallet) {
      console.log('removing wallet policy')
      console.log(wallet)
    },
    simpleSleep() { return new Promise(resolve => setTimeout(resolve, 3000))},

    async waitContract(transactionHash) {
      const web3 = this.$store.getters["wallet/networkHandler"]("contract").web3
      const apiEndpoint = this.$store.state.wallet.eth.activeApiEndpoint
        .replace('###NETWORK_IDENTIFIER###', this.wallet.network.identifier)
        web3.setProvider(apiEndpoint)
      const truthy = true
      while (truthy) {
        let receipt = web3.eth.getTransactionReceipt(transactionHash)
        console.log(receipt)
        if (typeof receipt === 'object' && receipt.hasOwnProperty('contractAddress')) {
          console.log("Your contract has been deployed at http://testnet.etherscan.io/address/" + receipt.contractAddress)
          console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io")
          break
        }
        console.log("Waiting a mined block to include your contract...")
        await this.simpleSleep(4000);
      }
    },
    switchMainAenStatus(wallet) {
      this.mainAenAddress = wallet.address
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
