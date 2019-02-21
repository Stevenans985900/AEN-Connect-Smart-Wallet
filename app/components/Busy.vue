<template>
  <span v-if="busy" class="text-xs-center">
      <v-chip>
        <v-avatar>
          <v-icon class="loader-icon">
            loop
          </v-icon>
        </v-avatar>
        {{ busyMessage }}
      </v-chip>
    </span>
</template>

<style scoped>
  .loader-icon {
    -webkit-animation:spin 3s linear infinite;
    -moz-animation:spin 3s linear infinite;
    animation:spin 3s linear infinite;
  }
  @-moz-keyframes spin { 100% { -moz-transform: rotate(-360deg); } }
  @-webkit-keyframes spin { 100% { -webkit-transform: rotate(-360deg); } }
  @keyframes spin { 100% { -webkit-transform: rotate(-360deg); transform:rotate(-360deg); } }
</style>

<script>
export default {
  computed: {
      busy() { return this.$store.state.busy.page },
      busyMessage() { return this.$store.state.busy.message }
  }
}
</script>

<style>
  #loading-spinner {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    text-align: center;
    background: #0d47a1;
    padding: 1rem;
  }
</style>
