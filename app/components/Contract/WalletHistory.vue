<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <v-card flat>
        <v-card-text>
          {{ $t('ethereum.message.contract_history_not_supported') }}
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>

export default {
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      options: {},
      transactions: {},
      loading: true
    }
  }
}
</script>
