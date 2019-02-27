<template>
  <v-form
    ref="newWalletForm"
    v-model="newValid"
    @submit.prevent="onSubmit"
  >
    <v-layout row wrap>
      <v-flex xs12>
        <v-select
          v-model="wallet"
          :items="ethereumWallets"
          return-object
          item-text="name"
          :label="$t('contract.label.managing_wallet')"
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="contractAddress"
          :rules="[rules.basic.required, rules.contract.length]"
          :label="$t('contract.label.contract_address')"
          required
        />
      </v-flex>
      <v-flex xs12>
        <v-alert
          v-if="loading === true"
          :value="true"
          color="info"
        >
          <v-progress-circular indeterminate />
        </v-alert>
        <v-alert
          v-if="contractSpidered === true && contractFound === true"
          :value="true"
          type="success"
        >
          The Contract has been found. Please review the details below
        </v-alert>
        <v-alert
          v-if="contractSpidered === true && contractFound === false"
          :value="true"
          type="info"
        >
          The Contract could not be found. Please check the address and / or selected network
        </v-alert>

        <v-card v-if="contractFound === true">
          <v-img
            src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
            aspect-ratio="2.75"
          />
          <v-card-title>{{ contractName }}</v-card-title>
          <v-card-text>
            <div>
              <strong>Symbol:</strong> {{ symbol }}<br>
              <strong>Decimals:</strong> {{ decimals }}
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-form>
</template>

<script>
import Debounce from 'lodash.debounce'

  function initialDataState() {
    return {
      newValid: false,
      loading: false,
      wallet: {},
      contractFound: false,
      contractName: '',
      contractSpidered: false,
      contractAddress: '',
      decimals: 0,
      symbol: '',
      rules: {
        basic: {
          required: value => !!value || 'Required.'
        },
        contract: {
          length: v => v.length === 42 || '42 Characters'
        },
        decimal: {
          max: v => v.length === 42 || '42 Characters'
        },
        symbol: {
          minLength: v => v.length === 42 || '42 Characters'
        }
      }
    }
  }
export default {
  data() { return initialDataState() },
  computed: {
    ethereumWallets() {
      return this.$store.getters['wallet/walletsByType']('eth')
    }
  },
  watch: {
    contractAddress: function () {
      this.getContractProfile()
    }
  },
  methods: {
    back() {
      this.currentStep--
    },
    complete() {
      this.$emit('complete', this.wallet)
      this.reset()
    },
    reset() {
      Object.assign(this.$data, initialDataState())
    },
    getContractProfile: Debounce(function () {
      // Make sure the contract address passes validation to save effort
      if (!this.$refs.newWalletForm.validate()) {
        console.log('form is invalid')
        return false
      }
      this.$store.commit('setLoading', {
        t: 'page',
        v: true,
        m: this.$t('contract.message.checking_contract')
      })

      this.contractFound = false
        import('~/class/network/contract/' + this.contractAddress).then((erc20Interface) => {
          this.contractFound = true
          this.contractName = erc20Interface.title
          this.decimals = erc20Interface.decimals
          this.symbol = erc20Interface.symbol
          this.$store.commit('setLoading', {
            t: 'page',
            v: false
          })
        })
          .catch(() => {
            // Use the abstract and lookup details of the contract
            this.loading = true
            // this.$store.dispatch('wallet/getLiveWallet', {
            //     type: 'contract',
            //     address: this.contractAddress
            //   }
            // ).then((wallet) => {
            //   this.wallet = wallet
            //   this.currentStep++
            //   this.startLiveListener(wallet)
            // })
            const networkHandler = this.$store.getters['wallet/networkHandler']('contract')
            // TODO Combine these in to batch actions
            networkHandler.erc20PublicMethod({
              contractAddress: this.contractAddress,
              method: 'name'
            }).then((contractName) => {
              this.contractSpidered = true
              this.loading = false
              this.contractFound = true
              this.contractName = contractName
            })
              .catch(() => {
                this.contractSpidered = true
                this.loading = false
              })
            networkHandler.erc20PublicMethod({
              contractAddress: this.contractAddress,
              method: 'symbol'
            }).then((contractSymbol) => {
              this.symbol = contractSymbol
            })
            networkHandler.erc20PublicMethod({
              contractAddress: this.contractAddress,
              method: 'decimals'
            }).then((decimals) => {
              console.log('from decimal')
              console.log(decimals)
              this.decimals = decimals
            })
            this.$store.commit('setLoading', {
              t: 'page',
              v: false
            })
          })
    }, 1000),
    /**
     * Add the contract to the wallet stack
     * @returns {boolean}
     */
    loadContract() {
      if (!this.$refs.inputForm.validate()) {
        console.log('form is invalid')
        return false
      }
      this.$store.dispatch('wallet/load', {
        type: 'contract',
        name: this.contractName,
        decimals: this.decimals,
        symbol: this.symbol,
        address: this.contractAddress,
        network: this.wallet.network,
        managerWalletAddress: this.wallet.address
      }
      ).then((wallet) => {
        console.debug(wallet)
        this.currentStep++
      })
    }
  }
}
</script>
