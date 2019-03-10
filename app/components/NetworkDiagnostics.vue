<template>
  <div>
    <v-menu v-model="netStatus" :close-on-content-click="false" offset-y>
      <v-btn slot="activator" :class="color" round small>
        {{ $t('network.label.connection_status') }} {{ connectionStatus }}
      </v-btn>

      <v-card max-width="400px">
        <v-card-text>
          <h3>{{ $t('common.label.network') }}</h3>
          <v-expansion-panel>
            <v-expansion-panel-content>
              <template v-slot:header>
                <v-list-tile avatar>
                  <v-list-tile-avatar>
                    <img src="/wallet/aen.png">
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ $t('network.label.aen') }} ({{ aenPing }}ms)</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
              <v-card>
                <v-card-text>
                  <v-select
                    :items="apiEndpoints"
                    :value="currentApi"
                    item-text="alias"
                    item-value="address"
                    :label="$t('network.label.current_api_endpoint')"
                  />
                  <v-btn @click="refreshAenApiEndpoint">
                    Find best API Server
                  </v-btn>
                  <p>Block Height: {{ aenHeight }}</p>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>

            <v-expansion-panel-content>
              <template v-slot:header>
                <v-list-tile avatar>
                  <v-list-tile-avatar>
                    <img src="/wallet/btc.png">
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ $t('network.label.aen') }} ({{ btcPing }}ms)</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
              <v-card>
                <v-card-text>
                  <p>
                    Block Height: {{ btcHeight }}
                  </p>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>

            <v-expansion-panel-content>
              <template v-slot:header>
                <v-list-tile avatar>
                  <v-list-tile-avatar>
                    <img src="/wallet/eth.png">
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ $t('network.label.eth') }} ({{ ethPing }}ms)</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
              <v-card>
                <v-card-text>
                  <p>
                    Block Height: {{ ethHeight }}
                  </p>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {
  data() {
    return {
      netStatus: false
    }
  },
  computed: {
      aenHeight() { return this.$store.state.wallet.aen.apiHeight },
      aenPing() { return this.$store.state.wallet.aen.apiPing },
      btcHeight() { return this.$store.state.wallet.btc.apiHeight },
      btcPing() { return this.$store.state.wallet.btc.apiPing },
      ethHeight() { return this.$store.state.wallet.eth.apiHeight },
      ethPing() { return this.$store.state.wallet.eth.apiPing },
    color() {
      if(this.$store.state.runtime.isOnline === false) {
        return 'red'
      } else {
        return 'green'
      }
    },
    connectionStatus() {
        // TODO turn this in to a hookable function
        if (this.$store.state.runtime.isOnline === false) { return this.$t('network.label.offline') }

        return this.$t('network.label.online')
    },
    connectionStrengthIcon() {
      let icon = 'signal_wifi_off'
      if(this.$store.state.runtime.isOnline === false) { return icon }
      if (this.currentPing < 9999) {
        icon = 'signal_wifi_4_bar'
      }
      return icon
    },
    blockHeight() {
      return this.$store.state.wallet.aen.blockHeight
    },
    blockScore() {
      return this.$store.state.wallet.aen.blockScore
    },
    currentPing() {
      return this.$store.state.wallet.aen.apiPing
    },
    currentApi: {
      get: function () {
        return this.$store.state.wallet.aen.activeApiEndpoint
      },
      set: function (value) {
        this.$store.commit('setApiEndpoint', value)
      }
    },
    apiEndpoints() {
      return this.$g('aen.api_endpoints')
    }
  },
    methods: {
        refreshAenApiEndpoint() {
            console.log('refreshing endpoin')
            this.$store.dispatch('wallet/rankApiNodes')
        }
    }
}
</script>
