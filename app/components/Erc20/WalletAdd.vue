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
                  v-if="contractSpidered === true && contractFound === true"
                  :value="true"
                  type="success"
                >The Contract is recognised locally and information will be autoloaded</v-alert>
                <v-alert
                  v-if="contractSpidered === true && contractFound === false"
                  :value="true"
                  type="info"
                >The Contract could not be recognised locally so, you will have to enter some extra information</v-alert>

                <v-text-field
                  v-if="contractSpidered === true && contractFound === false"
                  v-model="decimal"
                  :rules="[rules.basic.required, rules.decimal.max]"
                  label="Decimal"
                  required
                  placeholder="8"
                />
                <v-text-field
                  v-if="contractSpidered === true && contractFound === false"
                  v-model="symbol"
                  :rules="[rules.basic.required, rules.symbol.minLength]"
                  label="Symbol"
                  required
                  placeholder="AENC"
                />
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
                  :rules="[rules.basic.required, rules.decimal.max]"
                  label="Decimal"
                  required
                  placeholder="8"
                />
                <v-text-field
                  v-if="contractSpidered === true && contractFound === false"
                  v-model="symbol"
                  :rules="[rules.basic.required, rules.symbol.minLength]"
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
        addType: '',
        backupAgree: false,
        currentStep: 1,
        proceedValid: false,
        loading: true,
        wallet: {},
        contractFound: false,
        contractName: '',
        contractSpidered: false,
        contractAddress: '',
        decimal: 0,
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
    methods: {
      back() {
        this.currentStep--
      },
      complete() {
        console.log('emitting complete event from aen component')
        this.$emit('complete', true)
      },
      getContractProfile: Debounce(function() {
        console.log('Trying to get the contract profile')
        this.contractSpidered = true
        import("~/modules/network/erc20/" + this.contractAddress).then(erc20Interface => {
          console.log(erc20Interface)
          this.contractFound = true
          this.contractName = erc20Interface.title
          this.decimal = erc20Interface.decimal
          this.symbol = erc20Interface.symbol
        })
          .catch(err => {
            console.debug(err)
            this.contractFound = false

        })
      }, 1000),
      loadContract() {
        if (!this.$refs.inputForm.validate()) {
          console.log("form is invalid");
          return false;
        }
        this.$store.dispatch('wallet/load',{
            type: 'erc20',
            name: this.contractName,
            decimal: this.decimal,
            symbol: this.symbol,
            address: this.contractAddress,
            managerWalletAddress: this.wallet.address
          }
        ).then((wallet) => {
          console.debug(wallet)
          this.currentStep++

          // Activate a listener on the wallet to check when it is live on the network
          let walletCheckInterval = setInterval(
            function() {
              this.$store.dispatch('wallet/checkWalletLive', this.$store.state.wallet.context).then(response => {
                this.$store.commit('wallet/setProperty', {
                  address: this.$store.state.wallet.context.address,
                  key: 'onChain',
                  value: response
                });
                if (response === true) {
                  clearInterval(walletCheckInterval)
                }
              })
            }.bind(this),
            this.$store.state.wallet.internal.walletCheckInterval
          );
        })
      }
    }
  }
</script>
