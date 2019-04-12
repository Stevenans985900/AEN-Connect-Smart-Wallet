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
        return false
      }
      this.$store.dispatch('busy', 'contract.message.checking_contract')

      this.contractFound = false
      // Check if there is a contract interface definition within the wallet
      import('~/class/network/contract/' + this.contractAddress).then((erc20Interface) => {
        this.contractFound = true
        this.contractName = erc20Interface.title
        this.decimals = erc20Interface.decimals
        this.symbol = erc20Interface.symbol
          this.$store.dispatch('busy', false)
        // If app is not aware of the contract specification. This is very likely
          .catch(async () => {
            this.loading = true
            try {
              const networkHandler = this.$store.getters['wallet/networkHandler'](
                { type: 'contract', network: this.wallet.network.identifier })
              const contractDetails = await networkHandler.contractDetails(this.contractAddress)
              this.contractFound = true
              this.contractName = contractDetails.name
              this.decimals = contractDetails.decimals
              this.symbol = contractDetails.symbol
            } catch (e) {
              this.contractFound = false
            }
              this.$store.dispatch('busy', false)
          })
      })

    }, 1000),
    /**
     * Add the contract to the wallet stack
     * @returns {boolean}
     */
    loadContract() {
      if (!this.$refs.inputForm.validate()) {
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
      ).then(() => {
        this.currentStep++
      })
    }
  }
}
</script>
