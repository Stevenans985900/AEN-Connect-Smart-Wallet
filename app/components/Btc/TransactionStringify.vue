<template>
  <span>
    <span v-if="display === 'all' || display === 'direction'">
      <v-icon v-if="direction === 'incoming'">
        call_received
      </v-icon>
      <v-icon v-else>
        call_made
      </v-icon>
    </span>
    <span v-if="display === 'all' || display === 'date'">
      {{ date }}
    </span>
    <span v-if="display === 'all' || display === 'value'">
      {{ value }}
    </span>
  </span>
</template>

<script>
import { format } from 'date-fns'
export default {
  props: {
    display: {
      type: String,
      default: 'all'
    },
    transaction: {
      type: Object,
      default: function () {
        return {}
      }
    },
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  computed: {
    date() {
      return format(this.transaction.confirmed, 'YYYY-MM-DD HH:mm')
    },
    direction() {
      if(this.transaction.spent === false) {
        return 'incoming'
      }
      return 'outgoing'
    },
    value() {
      return this.transaction.value
    }
  }
}
</script>
