<template>
  <div v-if="busy" id="loading-spinner">
    <v-tooltip bottom>
      <span slot="activator">
        <h2>Busy</h2>
        <v-progress-circular indeterminate color="primary" />
      </span>
      <span>You can continue working during this time but, if there are any problems, you may lose your work.</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
	computed: {
		busy: {
			get: function () { return this.$store.getters.busy },
			set: function () {}
		}
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