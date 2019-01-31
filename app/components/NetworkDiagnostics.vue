<template>
  <div>
    <v-menu v-model="netStatus" :close-on-content-click="false" :nudge-width="200" offset-x>
      <v-btn slot="activator" flat>
        <v-avatar size="24">
          <v-icon v-text="connectionStrengthIcon" />
        </v-avatar>
      </v-btn>

      <v-card>
        <v-card-text>
          <v-select
            :items="apiEndpoints"
            :value="currentApi"
            item-text="alias"
            item-value="address"
            label="API Endpoint"
          />
          <p>Current Ping: {{ currentPing }} - Block Height: {{ blockHeight }}</p>
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
    connectionStrengthIcon() {
      let icon = 'signal_wifi_off'
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
      return this.$store.state.wallet.aen.activeApiPing
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
  }
}
</script>
