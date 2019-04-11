<template>
  <v-layout>
    <v-stepper v-model="currentStep" vertical>
      <v-stepper-step :complete="currentStep > 1" editable step="1">
        {{ $t('wallet.message.add_method') }}
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-radio-group v-model="addType">
          <v-radio :label="$t('wallet.label.create_new_now')" value="new" />
          <v-radio :label="$t('wallet.label.import_from_file')" value="fileImport" />
          <v-radio :label="$t('wallet.label.manual_input_existing')" value="manualRecover" />
        </v-radio-group>
        <v-btn color="primary" @click="currentStep = 2">
          {{ $t('common.action.continue') }}
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
              <restore-from-file :type="type" :main="main" @complete="walletRestoredFromFile" />
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
        {{ $t('wallet.label.review') }}
      </v-stepper-step>
      <v-stepper-content step="3">
        <v-layout
          v-if="wallet"
          row
          wrap
        >
          <v-flex xs12 md6 lg4>
            <h2>{{ $t('wallet.message.add_success') }}</h2>
            <h3>{{ wallet.name }}</h3>
            <p>{{ $t('wallet.message.capabilities') }}</p>
            <span v-if="addType === 'new'">
              <backup-wallet :wallet="wallet" />
              <v-form ref="backupForm" v-model="proceedValid">
                <v-checkbox
                  v-model="backupAgree"
                  :rules="[rules.basic.required]"
                  required
                  :label="$t('wallet.label.backup_understand')"
                />
                <p>{{ $t('wallet.message.initial_status') }}</p>
                <v-btn :disabled="!proceedValid" color="primary" @click="complete">
                  {{ $t('common.action.confirm') }}
                </v-btn>
              </v-form>
            </span>
            <v-btn v-else color="primary" @click="complete">
              {{ $t('common.action.confirm') }}
            </v-btn>
          </v-flex>
          <v-flex xs12 md6>
            <business-card :wallet="wallet" :include-private-key="true" :use-address-book="false" />
          </v-flex>
        </v-layout>
      </v-stepper-content>
    </v-stepper>
  </v-layout>
</template>

<style scoped>
  .v-stepper {
    box-shadow: none;
  }
</style>
<script>
  import BackupWallet from '~/components/BackupWallet'
  import RestoreFromFile from '~/components/RestoreFromFile'

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
  components: {
      BackupWallet,
      RestoreFromFile
    },
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
  watch: {
    type: function () {
      this.updateComponent()
    }
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
        this.reset()
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
      /**
       * Event listener for the
       * @param wallet
       */
      walletRestoredFromFile(wallet) {
          this.wallet = wallet
          this.currentStep++
      }
  }
}
</script>
