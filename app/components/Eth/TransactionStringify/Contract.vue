<template>
  <v-expansion-panel>
    <v-expansion-panel-content>
      <div slot="header">
        {{ date }} - {{ totalGas }} - {{ title }}
      </div>
      <v-card>
        <v-card-text>
          <p>You currently control {{ controlledTokens }} tokens</p>
          {{ transactionGas }} TX Gas - {{ operationGas }} Operation Gas<br >

        </v-card-text>
      </v-card>
      <hr>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
  import { format } from 'date-fns'
  import Web3 from "web3"
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
        title: '',
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
      this.title = this.transaction.hash
      this.fetchContractInfo()
    },
    methods: {
      fetchContractInfo() {
        import("~/modules/network/erc20/" + this.transaction.contractAddress).then(erc20Interface => {
          this.title = erc20Interface.title

          let contract = new this.web3.eth.Contract(erc20Interface.abi, this.transaction.contractAddress)

          console.log('here')
          console.log(erc20Interface.type)
          if (erc20Interface.type === 'token') {
            contract.methods.balanceOf(this.wallet.address).call().then(response => {
              console.log('From balanceOf public function: ' +  response)
              this.controlledTokens = response
            })
          }

          // contract.getPastEvents('allEvents').then(eventDetails => {
          //   console.log('HERE!')
          //   console.log(eventDetails)
          //   this.contractDetails = eventDetails
          // })
          //   .catch(function() {
          //     this.title = 'unrecognised contract'
          //     console.log('unrecognised contract. no problem')
          //   })
        })
      }
    }
  }
</script>