<template>
  <v-layout row wrap>
    <v-stepper v-model="currentStep" vertical>

      <v-stepper-step :complete="currentStep > 1" step="1">
        Add Method
        <small>Determine how you want to start managing the smart contract</small>
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-card>
          <v-card-text>
            <v-radio-group v-model="addType">
              <v-radio label="Manually Enter Details" value="manualInput" />
              <v-radio label="Import from File" value="fileImport" />
              <v-radio label="Scan QR code from camera" value="qrScan" />
            </v-radio-group>
          </v-card-text>
        </v-card>
        <v-btn color="primary" @click="currentStep = 2">Continue</v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="currentStep > 2" step="2" >
        {{ stepTwoLabel }}
      </v-stepper-step>
      <v-stepper-content step="2">

        <!-- MANUAL INPUT -->
        <v-card v-if="addType == 'manualInput'">
          <v-card-text>
            <v-layout row wrap>
              <v-form
                ref="inputForm"
                v-model="proceedValid"
                class="full-width"
                @submit.prevent="onSubmit"
              >
                <v-select
                  :items="ethereumWallets"
                  v-model="wallet"
                  return-object
                  item-text="name"
                  label="Managing Ethereum Wallet"
                />
                <v-text-field
                  v-model="contractAddress"
                  :rules="[rules.basic.required, rules.contract.length]"
                  label="Contract Address"
                  required
                  placeholder="0x8ec1865e528bbf32a155519c73995d704305acd1"
                />

                <v-alert
                  v-if="loading === true"
                  :value="true"
                  color="info"
                ><v-progress-circular indeterminate/> Checking contract</v-alert>
                <v-alert
                  v-if="contractSpidered === true && contractFound === true"
                  :value="true"
                  type="success"
                >The Contract has been found. Please review the details below</v-alert>
                <v-alert
                  v-if="contractSpidered === true && contractFound === false"
                  :value="true"
                  type="info"
                >The Contract could not be found. Please check the address and / or selected network</v-alert>

                <v-card v-if="contractFound === true">
                  <v-img
                    src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
                    aspect-ratio="2.75" />
                  <v-card-title primary-title>
                    <div>
                      <h3 class="headline mb-0">{{ contractName }}</h3>
                      <div>
                        <strong>Symbol:</strong> {{ symbol }}<br >
                        <strong>Decimals:</strong> {{ decimals }}
                      </div>
                    </div>
                  </v-card-title>
                </v-card>
              </v-form>
            </v-layout>
          </v-card-text>
        </v-card>

        <v-card v-if="addType == 'fileImport'">
          <v-card-text>
            <v-layout row wrap>
              <upload-button :file-changed-callback="fileUploaded" title="Choose file">
                <template slot="icon">
                  <v-icon>attach_file</v-icon>
                </template>
              </upload-button>
            </v-layout>
          </v-card-text>
        </v-card>

        <v-card v-if="addType == 'qrScan'">
          <v-card-text>
            <v-layout row wrap>
              <v-form ref="qrScan" v-model="qrValid" class="full-width">
                <v-select
                  :items="ethereumWallets"
                  v-model="wallet"
                  return-object
                  item-text="name"
                  label="Managing Ethereum Wallet"
                />
                <v-text-field
                  v-model="contractAddress"
                  :rules="[rules.basic.required, rules.contract.length]"
                  label="Contract Address"
                  required
                  placeholder="0x8ec1865e528bbf32a155519c73995d704305acd1"
                />


                <v-text-field
                  v-if="contractSpidered === true && contractFound === false"
                  v-model="decimal"
                  label="Decimal"
                  required
                  placeholder="8"
                />
                <v-text-field
                  v-if="contractSpidered === true && contractFound === false"
                  v-model="symbol"
                  label="Symbol"
                  required
                  placeholder="AENC"
                />
              </v-form>
            </v-layout>
          </v-card-text>
        </v-card>


        <v-btn :disabled="!proceedValid" color="primary" @click="loadContract">Load Contract</v-btn>


        <v-btn flat @click="back">Back</v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="currentStep > 3" step="3">Summary
        <small>Review your wallet</small>
      </v-stepper-step>
      <v-stepper-content step="3">
        <v-card>
          <v-card-text>
            <business-card :wallet="wallet" />
            <backup-wallet :wallet="wallet"/>
          </v-card-text>
        </v-card>
        <v-btn color="primary" @click="complete">Complete</v-btn>
      </v-stepper-content>

    </v-stepper>
  </v-layout>
</template>

<script>
  import BusinessCard from "~/components/BusinessCard"
  // import EventEmitter from "events"
  import UploadButton from "vuetify-upload-button"
  import BackupWallet from "~/components/BackupWallet"
  import networkHandler from "~/modules/network/Contract"
  import Debounce from "lodash.debounce"

  export default {
    components: {
      BackupWallet,
      BusinessCard,
      UploadButton
    },
    props: {
      main: {
        type: Boolean,
        default: function() {
          return false
        }
      }
    },
    data() {
      return {
        networkHandler: {},
        addType: '',
        backupAgree: false,
        currentStep: 1,
        proceedValid: false,
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
            required: value => !!value || "Required."
          },
          contract: {
            length: v => v.length === 42 || "42 Characters"
          },
          decimal: {
            max: v => v.length === 42 || "42 Characters"
          },
          symbol: {
            minLength: v => v.length === 42 || "42 Characters"
          }
        }
      }
    },
    computed: {
      ethereumWallets() {
        let wallets = []
        for(let wallet in this.$store.state.wallet.wallets) {
          if(this.$store.state.wallet.wallets[wallet].type === 'eth') {
            wallets.push(this.$store.state.wallet.wallets[wallet])
          }
        }
        return wallets
      },
      stepTwoLabel() {
        if(this.addType === 'fileImport') {
          return 'File Import'
        }
        return 'Enter Details'
      }
    },
    watch: {
      contractAddress: function() {
        this.getContractProfile()
      }
    },
    mounted() {
      this.networkHandler = new networkHandler(this.$store.state.wallet.ethereum.activeApiEndpoint)
    },
    methods: {
      back() {
        this.currentStep--
      },
      complete() {
        console.log('emitting complete event from aen component')
        this.$emit('complete', true)
      },
      getContractProfile: Debounce(function() {

        // Make sure the contract address passes validation to save effort
        if (!this.$refs.inputForm.validate()) {
          console.log("form is invalid");
          return false;
        }

        this.contractFound = false
        import("~/modules/network/contract/" + this.contractAddress).then(erc20Interface => {
          this.contractFound = true
          this.contractName = erc20Interface.title
          this.decimal = erc20Interface.decimal
          this.symbol = erc20Interface.symbol
        })
          .catch(err => {
            console.debug(err)
            // Use the abstract and lookup details of the contract
            this.loading = true

            // TODO Combine these in to batch actions
            this.networkHandler.erc20PublicMethod({
              contractAddress: this.contractAddress,
              method: 'name'
            }).then(contractName => {
              this.contractSpidered = true
              this.loading = false
              this.contractFound = true
              this.contractName = contractName
            })
              .catch(() => {
                this.contractSpidered = true
                this.loading = false
              })
            this.networkHandler.erc20PublicMethod({
              contractAddress: this.contractAddress,
              method: 'symbol'
            }).then(contractSymbol => {
              this.symbol = contractSymbol
            })
            this.networkHandler.erc20PublicMethod({
              contractAddress: this.contractAddress,
              method: 'decimals'
            }).then(decimals => {
              console.log('from decimal')
              console.log(decimals)
              this.decimals = decimals
            })
        })
      }, 1000),
      loadContract() {
        if (!this.$refs.inputForm.validate()) {
          console.log("form is invalid");
          return false;
        }
        this.$store.dispatch('wallet/load',{
            type: 'contract',
            name: this.contractName,
            decimal: this.decimal,
            symbol: this.symbol,
            address: this.contractAddress,
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
