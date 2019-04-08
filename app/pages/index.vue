<template>
  <v-container>
    <v-layout row justify-center align-center>
      <v-flex xs12>
        <v-card class="mb-4">
          <v-card-text>
            <v-form ref="makeWalletForm">
              <v-layout row align-center>
                <v-flex xs12>
                  <v-text-field
                    v-model="numberWallets"
                  />
                </v-flex>
                <v-flex md6>
                  <v-img src="/logo-800.png" contain />
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
function initialDataState() {
  return {
    
  }
}
export default {
  /**
   * DATA
   */
  data() { return initialDataState() },
  head() {
    return {
      title: 'AENConnect Smart Wallet - Welcomes you',
      meta: [
        { hid: 'description', name: 'description', content: 'The start of your blockchain journey with AEN, supporting existing networks' }
      ]
    }
  },
  /**
   * MOUNTED
   */
  mounted: function () {
    // Only start once global loading finished
    const preparationInterval = setInterval(
      function () {
        clearInterval(preparationInterval)
        this.$store.commit('setLoading', { t: 'router', v: false })
      }.bind(this),
      this.$store.state.time_definitions.controller_poll
    )
  },
  /**
   * METHODS
   */
  methods: {

  }
}
</script>
