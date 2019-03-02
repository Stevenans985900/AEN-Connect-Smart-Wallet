<template>
  <v-container>
    <v-layout row>
      <v-flex xs12>
        <v-card>
          <v-card-text>
            {{ $t('eula.message.introduction') }}
          </v-card-text>
          <v-card-actions>
            <v-btn to="/setup-wizard">
              {{ $t('eula.action.run_setup_wizard') }}
            </v-btn>
            <v-btn target="_blank" href="https://aencoin.com">
              {{ $t('eula.action.read_eula') }}
            </v-btn>
            <v-btn @click="eulaAgree = true">
              {{ $t('eula.action.agreeEula') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  /**
   * DATA
   */
  computed: {
    eulaAgree: {
      get: function () {
        return this.$store.state.user.eulaAgree
      },
      set: function (val) {
        this.$store.commit('setUserProperty', {
          key: 'eulaAgree',
          value: val
        })
      }
    }
  }
}
</script>
