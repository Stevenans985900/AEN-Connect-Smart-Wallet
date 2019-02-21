<template>
  <v-container grid-list-md>
    <v-layout row justify-center align-center mb-4>
      <v-flex xs12 mb2>
        <graph-balance-spread />
      </v-flex>
    </v-layout>
    <v-layout row justify-center align-center>
      <v-flex xs12>
        <h1>
          ICOs
        </h1>
        <v-layout row wrap>
          <v-flex xs12 md4>
            <v-card>
              <v-card-title>
                <v-img src="/question.png" max-width="50px" />
                &nbsp;&nbsp;
                <span>AENCoin</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                The first token for investing in and carrying out research on the blockchain
              </v-card-text>

              <v-card-actions>
                <v-list-tile class="grow">
                  <v-list-tile-content>
                    <v-list-tile-title>Finished</v-list-tile-title>
                  </v-list-tile-content>
                  <v-layout
                    align-center
                    justify-end
                  >
                    <v-icon class="mr-1">
                      attach_money
                    </v-icon>
                    <span class="subheading mr-2">
                      US$15M / US$22M
                    </span>
                  </v-layout>
                </v-list-tile>
              </v-card-actions>
            </v-card>
          </v-flex>

          <v-flex xs12 md4>
            <v-card>
              <v-card-title>
                <v-img src="/question.png" max-width="50px" />
                &nbsp;&nbsp;
                <span>AENCoin</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                The first token for investing in and carrying out research on the blockchain
              </v-card-text>

              <v-card-actions>
                <v-list-tile class="grow">
                  <v-list-tile-content>
                    <v-list-tile-title>Finished</v-list-tile-title>
                  </v-list-tile-content>
                  <v-layout
                    align-center
                    justify-end
                  >
                    <v-icon class="mr-1">
                      attach_money
                    </v-icon>
                    <span class="subheading mr-2">
                      US$15M / US$22M
                    </span>
                  </v-layout>
                </v-list-tile>
              </v-card-actions>
            </v-card>
          </v-flex>

          <v-flex xs12 md4>
            <v-card>
              <v-card-title>
                <v-img src="/question.png" max-width="50px" />
                &nbsp;&nbsp;
                <span>AENCoin</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                The first token for investing in and carrying out research on the blockchain
              </v-card-text>

              <v-card-actions>
                <v-list-tile class="grow">
                  <v-list-tile-content>
                    <v-list-tile-title>Finished</v-list-tile-title>
                  </v-list-tile-content>
                  <v-layout
                    align-center
                    justify-end
                  >
                    <v-icon class="mr-1">
                      attach_money
                    </v-icon>
                    <span class="subheading mr-2">
                      US$15M / US$22M
                    </span>
                  </v-layout>
                </v-list-tile>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import GraphBalanceSpread from '../components/GraphBalanceSpread'

export default {
  /**
   * COMPONENTS
   */
  components: {
    GraphBalanceSpread
  },
  head() {
    return {
      title: 'AENConnect Smart Wallet - Dashboard',
      meta: [
        { hid: 'description', name: 'description', content: 'Review your wallets and get details of the latest ICOs' }
      ]
    }
  },
  /**
   * MOUNTED
   */
  mounted: function () {
    console.debug('Dashboard Page: Started')
    // Only start once global loading finished
    const preparationInterval = setInterval(
      function () {
        if (this.$store.getters.booting === false) {
          clearInterval(preparationInterval)
          this.$store.commit('setLoading', { t: 'router', v: false })
        }
      }.bind(this),
      this.$g('internal.controllerPollReadyInterval')
    )
  }
}
</script>
