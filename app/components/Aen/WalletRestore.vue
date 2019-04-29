<template>
  <v-form
    ref="restoreWalletForm"
    v-model="restoreValid"
    @submit.prevent="onSubmit"
  >
    <v-layout row wrap>
      <v-flex v-if="multipleNetworks" xs12>
        <v-select
          v-model="network"
          :items="availableNetworks"
          item-text="name"
          item-value="identifier"
          label="Network"
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="walletName"
          :rules="[rules.basic.required, rules.walletName.minLength]"
          :error-messages="walletNameAvailable()"
          :label="$t('common.label.name')"
          required
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="walletPassword"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          :type="showPassword ? 'text' : 'password'"
          :rules="[rules.basic.required, rules.password.minLength]"
          :label="$t('common.label.password')"
          required
          counter
          @click:append="showPassword = !showPassword"
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="accountPrivateKey"
          :append-icon="showKey ? 'visibility_off' : 'visibility'"
          :type="showKey ? 'text' : 'password'"
          :rules="[rules.basic.required, rules.accountPrivateKey.length]"
          :label="$t('aen.label.accountPrivateKey')"
          counter
          required
          @click:append="showKey = !showKey"
        />
      </v-flex>
    </v-layout>
    <v-btn color="primary" @click="restoreWallet">
      {{ $t('common.action.restore') }}
    </v-btn>
  </v-form>
</template>

<script>
    // TODO Approaching level of abstraction where no need for full network components. when have time, complete
    function initialDataState() {
        return {
            restoreValid: false,
            walletName: '',
            walletPassword: '',
            password2: '',
            network: '',
            accountPrivateKey: '',
            proceedValid: false,
            showKey: false,
            showPassword: false,
            errorMessages: [],
            wallet: {},
            rules: {
                basic: {
                    required: value => !!value || 'Required.'
                },
                walletName: {
                    minLength: v => v.length >= 4 || 'Min 4 Characters'
                    // TODO Add the unique rule back in here
                    // unique: (v, vm) => !vm.$store.wallet.wallets.hasOwnProperty(v) || "Wallet name must be unique"
                },
                password: {
                    minLength: v => v.length >= 8 || 'Min 8 characters'
                },
                accountPrivateKey: {
                    length: v => v.length === 64 || 'Length is 64 Characters'
                }
            }
        }
    }

    export default {
       props: {
           main: {
               type: Boolean,
               default: false
           },
           type: {
                type: String,
                default: 'aen'
            }
        },
        /**
         * DATA
         */
        data: function () { return initialDataState() },
        /**
         * COMPUTED
         */
        computed: {
            networks() { return this.$g(this.type + '.available_networks') },
            environment() { return this.$store.state.runtime.environment },
            availableNetworks() { return Object.values(this.networks) },
            multipleNetworks() {
                if (Object.keys(this.networks).length > 1) {
                    return true
                }
                return false
            }
        },
        mounted: function() {
          this.reset()
            this.network = this.$store.state.wallet[this.type].network
        },
        methods: {
            complete(wallet) {
                this.$emit('complete', wallet)
                this.reset()
            },
            restoreWallet() {
                if (!this.$refs.restoreWalletForm.validate()) {
                    return false
                }
                const walletOptions = {
                    type: this.type,
                    network: this.network,
                    name: this.walletName,
                    password: this.walletPassword,
                    accountPrivateKey: this.accountPrivateKey,
                    main: this.main
                }
                this.$store.dispatch('wallet/load', walletOptions)
                    .then((wallet) => {
                        this.complete(wallet)
                    })
            },
            passwordsMatch() {
                return (this.walletPassword === this.password2) ? '' : this.$t('security.message.passwords_must_match')
            },
            walletNameAvailable() {
                return this.$store.getters['wallet/getByName'](this.walletName) ? this.$t('common.message.name_already_used') : ''
            },
            reset() {
                Object.assign(this.$data, initialDataState())
            }
        }
    }
</script>
