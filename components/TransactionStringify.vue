<template>
  <span>
    {{ type }}
  </span>
</template>

<script>
export default {
	props: {
		transaction: Object
	},
	computed: {
		type: function () {
			return this.transaction.type
		}
	}
}
</script>