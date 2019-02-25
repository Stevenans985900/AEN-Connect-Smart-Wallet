<template>
  <v-alert
    :value="true"
    color="info"
  >
    {{ $t('eula.message.introduction')}}
    <v-checkbox v-model="eulaAgree">
      <span slot="label" v-html="$t('eula.action.agreeEula') " />
    </v-checkbox>
  </v-alert>
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