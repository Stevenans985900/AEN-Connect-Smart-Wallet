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
                return-object
                item-text="name"
                label="Network"
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
                v-model="walletName"
                :rules="[rules.basic.required, rules.walletName.minLength]"
                :error-messages="walletNameAvailable()"
                label="Wallet Name"
                required
                placeholder="AEN Wallet"
        />
      </v-flex>
      <v-flex xs12>
        <v-text-field
                v-model="walletPassword"
                :append-icon="showPassword ? 'visibility_off' : 'visibility'"
                :type="showPassword ? 'text' : 'password'"
                :rules="[rules.basic.required, rules.password.minLength]"
                label="Wallet Password"
                required
                counter
                @click:append="showPassword = !showPassword"
        />
      </v-flex>
    </v-layout>
    <v-btn color="primary" @click="restorerWallet">
      Restore
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
        methods: {
            /**
             * Make sure the data is clean for adding a new wallet before trying to render the HTML.
             * @param file
             */
            beforeMount() {
                this.reset()
                if(!this.multipleNetworks) {
                    this.network = this.$store.state[this.type].defaultNetwork
                }
            },
            complete(wallet) {
                this.$emit('complete', wallet)
                this.reset()
            },
            createWallet() {
                if (!this.$refs.restoreWalletForm.validate()) {
                    return false
                }
                const walletOptions = {
                    type: this.type,
                    network: this.network,
                    name: this.walletName,
                    password: this.walletPassword,
                    main: this.main
                }
                this.$store.dispatch('wallet/load', walletOptions)
                    .then((wallet) => {
                        this.complete(wallet)
                    })
            },
            passwordsMatch() {
                return (this.walletPassword === this.password2) ? '' : 'Passwords must match'
            },
            walletNameAvailable() {
                return this.$store.getters['wallet/getByName'](this.walletName) ? 'Wallet Name is already in use' : ''
            },
            reset() {
                Object.assign(this.$data, initialDataState())
            }
        }
    }
</script>
