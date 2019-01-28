<template>
  <v-expansion-panel>
    <v-expansion-panel-content>
      <div slot="header" class="text-truncate">>
        {{ date }} - {{ totalGas }} - {{ title }}
        <hr>
      </div>
      <v-card>
        <v-card-text>
          <p>Contract Address: {{ transaction.contractAddress }}</p>
          <p>You currently control {{ controlledTokens }} tokens</p>
          <p>{{ transactionGas }} TX Gas - {{ operationGas }} Operation Gas</p>

        </v-card-text>
      </v-card>

    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
  import { format } from 'date-fns'
  import Web3 from "web3"
  import Contract from "~/class/network/Contract"

  export default {
    props: {
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
        web3: {},
        contractDetails: {},
        title: 'Unrecognised Contract',
        controlledTokens: 0
      }
    },
    computed: {
      date() {
        return format((this.transaction.timeStamp*1000), 'YYYY-MM-DD HH:mm')
      },
      totalGas() {
        return this.web3.utils.fromWei((this.transaction.cumulativeGasUsed.toString()), "ether")
      },
      transactionGas() {
        return this.web3.utils.fromWei((this.transaction.gasUsed.toString()), "ether")
      },
      operationGas() {
        return this.web3.utils.fromWei(((this.transaction.cumulativeGasUsed - this.transaction.gasUsed).toString()), "ether")
      }
    },
    watch: {
      transaction: {
        handler: function() {
          this.fetchContractInfo()
        },
        deep: true
      }
    },
    created() {
      this.web3 = new Web3(this.$store.state.wallet.ethereum.activeApiEndpoint)
    },
    mounted() {
      this.fetchContractInfo()
    },
    methods: {
      fetchContractInfo() {

        let networkHandler = new Contract(this.$store.state.wallet.ethereum.activeApiEndpoint)
        networkHandler.balance({
          managerWalletAddress: this.wallet.address,
          address: this.transaction.contractAddress
        })
          .then(response => {
            this.controlledTokens = response
          })
          .catch(function() {})

        import("~/class/network/contract/" + this.transaction.contractAddress).then(erc20Interface => {
          this.title = erc20Interface.title
        })
          .catch(function() {
            networkHandler.erc20PublicMethod({
              contractAddress: this.transaction.contractAddress,
              method: 'name'
            }).then(contractName => {
              this.title = contractName
            })
            .catch(function() {
              console.debug('This contract does not really exist...')
            })

          }.bind(this))
      }
    }

  }
</script>