<template>
  <span>
    <v-icon>dashboard</v-icon>
    - {{ data.namespaceName }}
    - <address-render :address="address" />
  </span>
</template>

<script>
import AddressString from '../Address'

export default {
	components: {
		AddressString
	},
	props: {
		data: Object
	},
	computed: {
		address () {
			if (!this.data.hasOwnProperty('signer')) return 'Unknown'
			return this.data.signer.address.address
		}
	}
}
</script>
