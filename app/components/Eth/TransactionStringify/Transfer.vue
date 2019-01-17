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
		address () {
			if (!this.transaction.hasOwnProperty('signer')) return 'Unknown'
			return this.transaction.signer.address.address
		},
		direction () {
			if (!this.transaction.hasOwnProperty('recipient')) return ''
      // Check whether the recipient is in the users wallet list
      console.debug('checking address direction')
      console.debug('recipient: '+this.data.recipient.address)
      console.debug('this address: '+this.wallet.address)
      if(this.transaction.recipient.address === this.wallet.address) {
        return 'incoming'
			} else {
				return 'outgoing'
			}
		},
		value () {
			if (!this.transaction.hasOwnProperty('mosaics')) return 0
		}
	},
  mounted() {
    console.debug(this.transaction)
  }
}
</script>
