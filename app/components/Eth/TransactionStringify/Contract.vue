<template>
  <span>
    <span v-if="display === 'all' || display === 'direction'">
      <v-icon v-if="direction === 'incoming'">
        call_received
      </v-icon>
      <v-icon v-else>
        call_made
      </v-icon>
    </span>
    <span v-if="display === 'all' || display === 'date'">
      {{ date }}
    </span>
    <span v-if="display === 'all' || display === 'value'">
      {{ controlledTokens }}
    </span>
    <span v-if="display === 'all' || display === 'title'">
      {{ title }}
    </span>
    <span v-if="display === 'all' || display === 'address'">
      <address-render :address="transaction.contractAddress" show-add />
    </span>
    <span v-if="display === 'all' || display === 'details'">
      <p>You currently control {{ controlledTokens }} tokens</p>
      <p>{{ transactionGas }} TX Gas - {{ operationGas }} Operation Gas</p>
    </span>
  </span>
</template>

<script>
import { format } from 'date-fns'

export default {
  props: {
    display: {
      type: String,
      default: 'all'
    },
    transaction: {
      type: Object,
      default: function () {
        return {}
      }
    },
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      networkHandler: null,
      contractDetails: {},
      title: 'Unrecognised Contract'
    }
  },
  computed: {
    date() {
      return format(this.transaction.timeStamp * 1000, 'YYYY-MM-DD HH:mm')
    },
    controlledTokens() {
      if(this.transaction.hasOwnProperty('amount')) {
        return this.transaction.amount + ' ' + this.transaction.symbol
      } else {
        return 0
      }
    },
    direction() {
      if(this.transaction.from.toUpperCase() === this.wallet.address.toUpperCase()) {
        return 'incoming'
      } else {
        return 'outgoing'
      }
    },
    totalGas() {
      return this.transaction.cumulativeGasUsed
    },
    transactionGas() {
      return this.transaction.gasUsed
    },
    operationGas() {
      return this.transaction.cumulativeGasUsed - this.transaction.gasUsed
    }
  },
  mounted() {
    this.fetchContractInfo()
  },
  methods: {
    fetchContractInfo() {
      let extraTransactionInfo = {}
      let transactionKey
      const networkHandler = this.$store.getters['wallet/networkHandler']('contract')
      const apiEndpoint = this.$store.state.wallet.eth.activeApiEndpoint
          .replace('###NETWORK_IDENTIFIER###', this.wallet.network.identifier)
      networkHandler.setProvider(apiEndpoint)
      // Parse and extend the transaction object with extra information
      if(!this.transaction.hasOwnProperty('parsed')) {
        extraTransactionInfo.parsed = true
        transactionKey = format((this.transaction.timeStamp * 1000), 'YYYY-MM-DD HH:mm')
      }

      // Check whether a wallet record exists for handling the contract
      if(!this.$store.state.wallet.wallets.hasOwnProperty(this.transaction.contractAddress)) {
        let walletOptions = {
          type: 'contract',
          address: this.transaction.contractAddress,
          network: this.wallet.network,
          managerWalletAddress: this.wallet.address
        }
        // Try and get details of the contract from file definition if available
        import('~/class/network/contract/' + this.transaction.contractAddress).then((erc20Interface) => {
          walletOptions.contractName = erc20Interface.name
          walletOptions.decimals = erc20Interface.decimals
          walletOptions.symbol = erc20Interface.symbol

          if(!this.transaction.hasOwnProperty('parsed')) {
            extraTransactionInfo.contractName = erc20Interface.name
            extraTransactionInfo.decimals = erc20Interface.decimals
            extraTransactionInfo.symbol = erc20Interface.symbol
          }

          this.addWallet(walletOptions)
        })
        // If app is not aware of the contract specification, try and get details from the wire. this is quite likely
        .catch(async () => {
          try {
            console.log('Going to add a contract with the following address: ' + this.transaction.contractAddress)
            walletOptions.contractName = await networkHandler.erc20PublicMethod({
              contractAddress: this.transaction.contractAddress,
              method: 'name'
            })
            walletOptions.decimals = await networkHandler.erc20PublicMethod({
              contractAddress: this.transaction.contractAddress,
              method: 'decimals'
            })
            walletOptions.symbol = await networkHandler.erc20PublicMethod({
              contractAddress: this.transaction.contractAddress,
              method: 'symbol'
            })
            this.addWallet(walletOptions)

            if(!this.transaction.hasOwnProperty('parsed')) {
              extraTransactionInfo.contractName = walletOptions.contractName
              extraTransactionInfo.decimals = walletOptions.decimals
              extraTransactionInfo.symbol = walletOptions.symbol
            }
          } catch (e) {
            this.contractFound = false
          }
        })
      } else {
        extraTransactionInfo.contractName = this.$store.state.wallet.wallets[this.transaction.contractAddress].name
        extraTransactionInfo.decimals = this.$store.state.wallet.wallets[this.transaction.contractAddress].decimals
        extraTransactionInfo.symbol = this.$store.state.wallet.wallets[this.transaction.contractAddress].symbol
      }

      if(!this.transaction.hasOwnProperty('parsed')) {
        networkHandler
          .balance({
            managerWalletAddress: this.wallet.address,
            address: this.transaction.contractAddress
          })
          .then((response) => {
              extraTransactionInfo.amount = response
              const newTransaction = Object.assign({}, this.transaction, extraTransactionInfo)
              this.$store.commit('wallet/TRANSACTION', {
                key: transactionKey,
                transaction: newTransaction,
                wallet: this.wallet
              })
            })
      }
      //
      // networkHandler
      //     .erc20PublicMethod({
      //       contractAddress: this.transaction.contractAddress,
      //       method: 'name'
      //     })
      //     .then((contractName) => {
      //       this.title = contractName
      //     })
      //     .catch(function () {
      //         console.debug('This contract does not really exist...')
      //       })

    },
    addWallet(walletOptions) {
      this.$log.debug('About to try adding a contract for management sake', walletOptions)
      this.$store.dispatch('wallet/load', walletOptions)
      .then((wallet) => {
        this.$store.commit('showNotification', {
          type: 'success',
          message: this.$t('wallet.message.contract_added' + ': ' + wallet.name)
        })
      })
    }
  }
}
</script>
