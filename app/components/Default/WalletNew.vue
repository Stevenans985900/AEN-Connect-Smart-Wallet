<template>
  <v-form
    ref="newWalletForm"
    v-model="newValid"
    @submit.prevent="onSubmit"
  >
    <v-layout row wrap>
      <v-flex v-if="multipleNetworks" xs12>
        <v-select
          v-model="network"
          :items="availableNetworks"
          return-object
          item-text="name"
          :label="$t('common.label.network')"
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="walletName"
          :rules="[rules.basic.required, rules.walletName.minLength]"
          :error-messages="walletNameAvailable()"
          :label="$t('wallet.label.name')"
          required
          @keyup.enter="createWallet"
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
          @keyup.enter="createWallet"
        />
        <password v-model="walletPassword" :strength-meter-only="true" />
      </v-flex>
      <v-flex xs12>
        <v-text-field
          v-model="password2"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          :type="showPassword ? 'text' : 'password'"
          :rules="[rules.basic.required, rules.password.minLength]"
          :label="$t('common.label.password_repeat')"
          :error-messages="passwordsMatch()"
          required
          counter
          @click:append="showPassword = !showPassword"
          @keyup.enter="createWallet"
        />
      </v-flex>
    </v-layout>
    <v-btn color="primary" @click="createWallet">
      {{ $t('common.action.create') }}
    </v-btn>
  </v-form>
</template>

<script>
    import Password from 'vue-password-strength-meter'
    // TODO Approaching level of abstraction where no need for full network components. when have time, complete
    function initialDataState() {
        return {
            newValid: false,
            walletName: '',
            walletPassword: '',
            password2: '',
            network: {},
            accountPrivateKey: '',
            proceedValid: false,
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
                privateKey: {
                    length: v => v.length === 64 || 'Length is 64 Characters'
                }
            }
        }
    }

    export default {
        /**
         * COMPONENTS
         */
        components: {
            Password
        },
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
            multipleNetworks() {
                if (this.$g(this.type + '.available_networks').length > 1) {
                    return true
                }
                return false
            }
        },
      watch: {
        type: function () {
          if(!this.multipleNetworks) {
            this.network = this.$g(this.type + '.available_networks')[0]
          }
        }
      },
      mounted: function () {
        this.walletName = this.type + '-' +this.$store.state.wallet[this.type].walletCount
        if(!this.multipleNetworks) {
          this.network = this.$g(this.type + '.available_networks')[0]
        }
      },
        methods: {
            back() {
              this.currentStep--
            },
            complete(wallet) {
                this.$forceUpdate()
                this.$emit('complete', wallet)
                this.reset()
            },
            createWallet() {
                if (!this.$refs.newWalletForm.validate()) {
                    return false
                }
                const walletOptions = {
                    type: this.type,
                    network: this.$store.state.wallet[this.type].network,
                    name: this.walletName,
                    password: this.walletPassword,
                    main: this.main
                }
                this.$store.dispatch('wallet/new', walletOptions)
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
