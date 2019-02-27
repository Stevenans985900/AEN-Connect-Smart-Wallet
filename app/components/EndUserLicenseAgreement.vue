<template>
  <v-container >
    <v-layout row>
      <v-flex xs12>
        <v-alert
          :value="true"
        >
          <span v-html="$t('eula.message.introduction')" />
          <v-checkbox v-model="eulaAgree">
            <span slot="label">
              {{ $t('eula.action.agreeEula') }}
            </span>
          </v-checkbox>
        </v-alert>
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