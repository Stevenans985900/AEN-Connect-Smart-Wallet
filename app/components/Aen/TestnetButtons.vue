<template>
  <v-menu v-if="testnet" offset-y>
    <v-btn
      slot="activator"
      small
      outline
    >
      {{ $t('network.label.testnet_functions') }}
      <v-icon>arrow_drop_down</v-icon>
    </v-btn>
    <v-list>
      <v-list-tile
        :href="faucet.address + '?address=' + wallet.address.toUpperCase()"
        target="_blank"
      >
        <v-list-tile-title>{{ $t('network.action.goto_faucet') }}</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>

    export default {
        props: {
            wallet: {
                type: Object,
                default: function () {
                    return {}
                }
            }
        },
        computed: {
            faucet() {
                return this.$g('aen.faucets')[0]
            },
            testnet() {
                if (this.$g(this.wallet.type + '.available_networks.' + this.wallet.network).hasOwnProperty('testing')) {
                    return true
                }
                return false
            }
        }
    }
</script>
