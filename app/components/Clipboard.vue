<template>
  <v-btn v-clipboard:copy="data" v-clipboard:success="onCopy" :outline="showOutline" flat small :block="wide" :class="{'evenSmaller': $vuetify.breakpoint.smAndDown}">
    <v-icon small>
      file_copy
    </v-icon>&nbsp;&nbsp;{{ display }}
  </v-btn>
</template>

<style scoped>
  .v-btn {
    font-size: 0.8rem;
    max-width: 100%;
    overflow:hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    justify-content: start;
  }
  .evenSmaller {
    font-size: 0.7rem !important;
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
      },
      showOutline: {
        type: Boolean,
        default: true
      },
      wide: {
          type: Boolean,
          default: false
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
          message: this.data + this.$t('clipboard.message.x_copied')
        })
      }
    }
  }
</script>
