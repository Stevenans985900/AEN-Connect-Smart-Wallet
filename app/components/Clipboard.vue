<template>
  <v-btn v-clipboard:copy="data" v-clipboard:success="onCopy" flat small text-truncate
         class="smaller-font"
  >
    <v-icon small>
      file_copy
    </v-icon>&nbsp;&nbsp;{{ display }}
  </v-btn>
</template>

<style scoped>
  .smaller-font {
    font-size: 0.8rem;
    width: 20rem;
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
