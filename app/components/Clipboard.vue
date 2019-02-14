<template>
  <v-btn v-clipboard:copy="data" v-clipboard:success="onCopy" flat small
         :class="{'smaller-font': $vuetify.breakpoint.smAndDown}"
  >
    <v-icon small>
      file_copy
    </v-icon>&nbsp;&nbsp;{{ display }}
  </v-btn>
</template>

<style scoped>
  .smaller-font {
    font-size: 0.6rem;
  }
</style>

<script>
  export default {
    props: {
      data: {
        type: String,
        default: ''
      },
      displayText: {
        type: String,
        default: ''
      }
    },
    computed: {
      display() {
        return this.displayText !== '' ? this.displayText : this.data
      }
    },
    methods: {
      onCopy() {
        this.$store.commit('showNotification', {
          type: 'success',
          message: this.data + ' - copied to clipboard'
        })
      }
    }
  }
</script>