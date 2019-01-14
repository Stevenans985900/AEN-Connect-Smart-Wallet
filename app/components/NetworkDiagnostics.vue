<template>
  <div>
    <v-menu v-model="netStatus" :close-on-content-click="false" :nudge-width="200" offset-x>
      <v-btn slot="activator" flat>
        <v-avatar size="24">
          <v-icon v-text="connectionStrengthIcon" />
        </v-avatar>
      </v-btn>

      <v-card>
        <v-card-title>Settings</v-card-title>
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
    };
  },
  computed: {
    connectionStrengthIcon() {
      let icon = 'signal_cellular_off'
      if (this.currentPing < 200) {
        icon = 'signal_cellular_4_bar';
      } else if (this.currentPing < 500) {
        icon = 'signal_cellular_3_bar';
      } else if (this.currentPing < 1500) {
        icon = 'signal_cellular_2_bar';
      } else if (this.currentPing < 5000) {
        icon = 'signal_cellular_1_bar';
      }
      console.log('computed strength and going to use: '+icon)
      return icon
    },
    blockHeight() {
      return this.$store.state.wallet.internal.blockHeight;
    },
    blockScore() {
      return this.$store.state.wallet.internal.blockScore;
    },
    currentPing() {
      return this.$store.state.wallet.internal.activeApiPing;
    },
    currentApi: {
      get: function() {
        return this.$store.state.wallet.internal.activeApiEndpoint;
      },
      set: function(value) {
        this.$store.commit("setApiEndpoint", value);
        this.$walletService.Aen.updateActiveApiEndpoint({
                  address: this.$store.state.wallet.internal.activeApiEndpoint
                }
        );
      }
    },
    apiEndpoints() {
      return this.$g("aen.api_endpoints");
    }
  }
};
</script>
