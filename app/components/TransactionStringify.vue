<template>
  <component :is="component" :data="transaction" v-if="component" />
</template>

<script>
import { TransactionType } from 'chain-js-sdk'
export default {
	props: {
		transaction: Object
	},
	data () {
		return {
			component: null,
			type: ''
		}
	},
	mounted () {
		if (this.transaction.hasOwnProperty('type')) {
			switch (this.transaction.type) {
			case TransactionType.REGISTER_NAMESPACE:
				this.type = 'Namespace'
				break
			case TransactionType.TRANSFER:
				this.type = 'Transfer'
				break
			default:
				console.debug('TS:M:Unrecognised transfer type')
			}
		}
		if (this.type) {
			try {
				this.component = () => import('./TransactionStringify/' + this.type)
			} catch (err) {
				console.debug(err)
			}
		} else {
			this.component = () => import('./TransactionStringify/Default')
		}
	}
}
</script>