<template>
  <span>
    <v-icon v-if="direction === 'incoming'">
      call_received
    </v-icon>
    <v-icon v-else>call_made</v-icon>
    - {{ value }}
    - <address-render :address="address" show-add />
  </span>
</template>

<script>
export default {
	props: {
		data: {
            type: Object,
            default: function () {
                return {}
            }
        }
	},
	computed: {
		address () {
			if (!this.data.hasOwnProperty('signer')) return 'Unknown'
			return this.data.signer.address.address
		},
		direction () {
			if (!this.data.hasOwnProperty('recipient')) return ''
			if (this.data.recipient.address === this.$account.$store.state.account.address.address) {
				return 'incoming'
			} else {
				return 'outgoing'
			}
		},
		value () {
			if (!this.data.hasOwnProperty('mosaics')) return 0
			var mosaicCount = this.data.mosaics.length
			for (var currentRound = 0; mosaicCount > currentRound; currentRound++) {
				var value = this.data.mosaics[currentRound].amount.lower / 1000000
				let b = value.toFixed(6).split('.')
				let r = b[0].split(/(?=(?:...)*$)/).join(',')
				return r
			}
		}
	}
}
</script>
