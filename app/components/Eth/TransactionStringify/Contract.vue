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
      title: 'Unrecognised Contract',
      controlledTokens: 0
    }
  },
  computed: {
    date() {
      return format(this.transaction.timeStamp * 1000, 'YYYY-MM-DD HH:mm')
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
  watch: {
    transaction: {
      handler: function () {
        this.fetchContractInfo()
      },
      deep: true
    }
  },
  mounted() {
    this.fetchContractInfo()
  },
  methods: {
    async fetchContractInfo() {
      const networkHandler = this.$store.getters['wallet/networkHandler']('contract')

      // Check whether a wallet record exists for handling the contract
      if(!this.$store.state.wallet.wallets.hasOwnProperty(this.transaction.contractAddress)) {
        console.log('no reference in wallets to contract located')

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
          this.addWallet(walletOptions)
        })
        // If app is not aware of the contract specification, try and get details from the wire. this is quite likely
        .catch(async () => {
          try {
            const contractDetails = await networkHandler.contractDetails(this.transaction.contractAddress)
            walletOptions.contractName = contractDetails.name
            walletOptions.decimals = contractDetails.decimals
            walletOptions.symbol = contractDetails.symbol
            this.addWallet(walletOptions)
          } catch (e) {
            this.contractFound = false
          }
        })
      }

      networkHandler
        .balance({
          managerWalletAddress: this.wallet.address,
          address: this.transaction.contractAddress
        })
        .then((response) => {
          this.controlledTokens = response
        })

      networkHandler
          .erc20PublicMethod({
            contractAddress: this.transaction.contractAddress,
            method: 'name'
          })
          .then((contractName) => {
            this.title = contractName
          })
          .catch(function () {
              console.debug('This contract does not really exist...')
            })

    },
    addWallet(walletOptions) {
      console.log('ADDING')
      console.debug('Going to try adding Contract as Wallet')
      console.debug(walletOptions)

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
