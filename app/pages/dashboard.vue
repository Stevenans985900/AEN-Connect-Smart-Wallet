<template>
  <v-layout column justify-center align-center>
        <v-container
            fluid
            grid-list-md
        >
            <v-layout row wrap>
							<!-- ACCOUNT OVERVIEW -->
              <v-flex xs12 v-if="account.public === false">
                <v-alert
                  :value="true"
                  type="info"
                >
                  Your wallet is only local. In order to have a network presence, please add some
                  coins to it.
                </v-alert>
              </v-flex>
            </v-layout>

            <v-layout>
            <!-- FAUCET -->
            <v-flex x12 sm6 v-if="faucets.length">
              <v-card >
                <v-img
                  src="/faucet.png"
                ></v-img>

                <v-card-title primary-title>
                  <div>
                    <h3 class="headline mb-0">Visit Faucet</h3>
                    <div>If you need some coins to get started with the network.</div>
										<v-btn
											v-for="(faucet) in faucets"
											:key="faucet.address"
											:href="faucet.address" target="_blank"
										>Visit: {{ faucet.name }}</v-btn>
                  </div>
                </v-card-title>
              </v-card>
            </v-flex>

            <!-- TRANSFERS -->
            <v-flex xs12 sm6>
              <v-card next to="ledger">
                <v-img
                  src="/ledger.png"
                ></v-img>

                <v-card-title primary-title>
                  <div>
                    <h3 class="headline mb-0">Buy / Sell Coin</h3>
                    <div>Top up your coins and check the latest prices</div>
                  </div>
                </v-card-title>
              </v-card>
            </v-flex>

          </v-layout>
        </v-container>
  </v-layout>
</template>

<script>
export default {
	computed: {
		faucets () { return this.$g('faucets') },
		account () { return this.$account.$store.state },
		networkIdentifier () { return this.$store.state.networkIdentifier }
	},
	created: function () {
		// Only start once global loading finished
		var preperationInterval = setInterval(function () {
			if (this.$store.getters.booting === false) {
				clearInterval(preperationInterval)
				this.$store.commit('setLoading', { 't': 'router', 'v': false })
			}
		}.bind(this), 2000)
	}
}
</script>
