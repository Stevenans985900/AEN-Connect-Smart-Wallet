<template>
  <div>
    <v-menu v-model="netStatus" :close-on-content-click="false" :nudge-width="200" offset-x>
      <v-btn slot="activator" flat>
        <v-avatar size="24">
          <v-icon>signal_cellular_{{ connectionStrength }}_bar</v-icon>
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
    connectionStrength() {
      if (this.currentPing < 200) {
        return 4;
      } else if (this.currentPing < 500) {
        return 3;
      } else if (this.currentPing < 1500) {
        return 2;
      } else if (this.currentPing < 3000) {
        return 1;
      } else {
        return 1;
      }
    },
    blockHeight() {
      return this.$store.state.internal.block_height;
    },
    blockScore() {
      return this.$store.state.internal.block_score;
    },
    currentPing() {
      return this.$store.state.internal.activeApiPing;
    },
    currentApi: {
      get: function() {
        return this.$store.state.internal.activeApiEndpoint;
      },
      set: function(value) {
        this.$store.commit("setApiEndpoint", value);
        this.$walletService.Aen.updateActiveApiEndpoint({
                  address: this.$store.state.internal.activeApiEndpoint
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
