<template>
  <v-container>
    <v-layout row justify-center align-center>
      <!-- Contacts table -->
      <v-flex xs12>
        <v-toolbar class="primary mb-2">
          <v-toolbar-title>
            {{ $t('common.navigation.exchange') }}
          </v-toolbar-title>
        </v-toolbar>
        <v-card>
          <v-card-text>
            {{ $t('common.message.coming_soon') }}
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  function initialDataState() {
    return {
      interval: null
    }
  }
  export default {
    /**
     * DATA
     * @returns {{dialog: boolean, headers: *[], search: string}}
     */
    data() { return initialDataState() },
    head() {
      return {
        title: 'AENConnect Smart Wallet - Address Book',
        meta: [
          { hid: 'description', name: 'description', content: 'The address book makes remembering all those addresses a breeze!' }
        ]
      }
    },
    /**
     * MOUNTED
     */
    mounted: function () {
      this.$log.debug('Dashboard Startup')
      // Only start once global loading finished
      if (process.client) {
        this.interval = setInterval(
          function () {
            if (this.$store.getters.booting === false) {
              clearInterval(this.interval)
              this.$store.commit('setLoading', { t: 'router', v: false })
            }
          }.bind(this),
          this.$store.state.time_definitions.controller_poll
        )
      }
    },
    beforeDestroy() {
      clearInterval(this.interval)
    },
  }
</script>
