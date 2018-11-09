<template>
  <div>
    <v-menu
        v-model="netStatus"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
      >
				<v-btn slot="activator" flat>
					<v-avatar size="24">
						  <v-icon>signal_cellular_{{ connectionStrength }}_bar</v-icon>
					</v-avatar>
				</v-btn>

        <v-card>
          <v-card-title>Network</v-card-title>
          <v-card-text>
            <p>Ping: {{ currentPing }}</p>
            <p>Block Height: {{ blockHeight }}</p>
            <p>Block Score: {{ blockScore }}</p>
            <v-list>
              <v-list-tile>
                <v-select
                  :items="apiEndpoints"
                  item-text="alias"
                  item-value="address"
                  :value="currentApi"
                  label="API Endpoint"
                ></v-select>
              </v-list-tile>
            </v-list>
          </v-card-text>
        </v-card>
      </v-menu>

  </div>
</template>

<script>
export default {
	computed: {
		connectionStrength () {
			if(this.currentPing < 200) {
				return 4
			} else if (this.currentPing < 500) {
				return 3
			} else if (this.currentPing < 1500) {
				return 2
			} else if (this.currentPing < 3000) {
				return 1
			} else {
				return 1
			}
		},
		blockHeight () { return this.$store.state.internal.block_height },
		blockScore () { return this.$store.state.internal.block_score },
		currentPing () { return this.$store.state.internal.api_ping },
		currentApi: {
			get: function () { return this.$store.state.internal.api_endpoint },
			set: function (value) { this.$store.commit('setApiEndpoint', value) }
		},
		apiEndpoints () { return this.$g('api_endpoints') }
	},
	data () {
		return {
			netStatus: false
		}
	}
}
</script>
