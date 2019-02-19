<template>
  <v-layout>
    <v-stepper v-model="currentStep" vertical>
      <v-stepper-step :complete="currentStep > 1" step="1">
        How do you want to add your wallet?
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-radio-group v-model="addType">
          <v-radio label="Create a New Wallet right now" value="new" />
          <v-radio label="Import an existing wallet from file" value="fileImport" />
          <v-radio label="Manually enter wallet private key and password" value="manualRecover" />
        </v-radio-group>
        <v-btn color="primary" @click="currentStep = 2">
          Continue
        </v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="currentStep > 2" step="2">
        {{ stepTwoLabel }}
      </v-stepper-step>
      <v-stepper-content step="2">
        <!-- Create right now -->
        <v-card v-if="addType == 'new'" max-width="500px">
          <v-card-text>
            <component :is="componentWalletNew" v-if="componentWalletNew" :type="type" :main="main" @complete="walletSetupComplete" />
          </v-card-text>
        </v-card>
        <!-- Import through file -->
        <v-card v-if="addType == 'fileImport'">
          <v-card-text>
            <v-layout row wrap>
              <restore-from-file @complete="walletRestoredFromFile" />
            </v-layout>
          </v-card-text>
        </v-card>
        <!-- Manually recover through input entry -->
        <v-card v-if="addType == 'manualRecover'">
          <v-card-text>
            <v-layout row wrap>
              <component :is="componentWalletRestore" v-if="componentWalletRestore" :type="type" :main="main" @complete="walletSetupComplete" />
            </v-layout>
          </v-card-text>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :complete="currentStep > 3" step="3">
        Review your wallet
      </v-stepper-step>
      <v-stepper-content step="3">
        <v-layout v-if="wallet">
          <v-flex xs12 md6 lg4>
            <h1>Wallet Created: {{ wallet.name }}</h1>
            <p>
              With this wallet, you can now receive and transfer tokens using the AENChain network. Before proceeding,
              we strongly recommend you create a backup of your wallet using the button below.
            </p>
            <span v-if="addType === 'new'">
              <backup-wallet :wallet="wallet" />
              <v-form ref="backupForm" v-model="proceedValid">
                <v-checkbox
                  v-model="backupAgree"
                  :rules="[rules.basic.required]"
                  required
                  label="I have backed up my wallet / understand that keeping it safe is my duty"
                />
                <p>
                  At the moment, your wallet is not live on the network. It is necessary to perform a transaction using
                  this address before it has any presence.
                </p>
                <v-btn :disabled="!proceedValid" color="primary" @click="complete">
                  Complete
                </v-btn>
              </v-form>
            </span>
            <v-btn v-else color="primary" @click="complete">
              Complete
            </v-btn>
          </v-flex>
          <v-flex xs12 md6 lg3>
            <business-card :wallet="wallet" :include-private-key="true" :use-address-book="false" />
          </v-flex>
        </v-layout>
      </v-stepper-content>
    </v-stepper>
  </v-layout>
</template>

<script>
  import BackupWallet from '~/components/BackupWallet'

  function initialDataState() {
      return {
          addType: 'new',
          currentStep: 1,
          backupAgree: false,
          proceedValid: false,
          rules: {
              basic: {
                  required: value => !!value || 'Required.'
              }
          },
          componentWalletNew: null,
          componentWalletRestore: null,
          wallet: null
      }
  }
export default {
  components: { BackupWallet },
    props: {
    main: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() { return initialDataState() },
  computed: {
      stepTwoLabel() {
          if (this.addType === 'fileImport') {
              return 'File Import'
          }
          return 'Enter Details'
      },
    },
  mounted: function () {
    this.updateComponent()
  },
  methods: {
      back() {
          this.currentStep--
      },
      walletSetupComplete(wallet) {
          this.wallet = wallet
          this.currentStep++
      },
    complete() {
      this.$emit('complete', this.wallet)
    },
    updateComponent() {
      if(this.type !== '') {
        const networkType = this.type[0].toUpperCase() + this.type.slice(1)
        this.componentWalletNew = () => import('~/components/' + networkType + '/WalletNew')
            .catch(function () {
                this.componentWalletNew = () => import('~/components/Default/WalletNew')
            }.bind(this))
          this.componentWalletRestore = () => import('~/components/' + networkType + '/WalletRestore')
              .catch(function () {
                  this.componentWalletRestore = () => import('~/components/Default/WalletRestore')
              }.bind(this))
      }
      },
      reset() {
          Object.assign(this.$data, initialDataState())
      },
  }
}
</script>
