import Vue from 'vue'
import WalletService from '~/services/WalletService'
import PluginStore from '~/services/PluginStore'

Vue.use(WalletService, {
	store: new PluginStore(
		{
			// Group these in meta
			intervalTime: 5000,
			intervalReference: false,
			apiEndpoint: false,
			query: {
				resultSize: 10,
				resultSet: 1
			},
			meta: {
				balance: 0
			},
			// Group these in to context specific
			account: {},
			accountInfo: {},
			address: {},
			mosaics: [],
			wallet: {},
			userTransactions: {
				confirmed: [],
				historical: [],
				incoming: [],
				outgoing: [],
				unconfirmed: []
			},
			// Group these internal
			services: {
				accountHttp: false,
				mosaicHttp: false,
				namespaceHttp: false,
				mosaicService: false,
				transactionHttp: false
			}
		}
	)
})
