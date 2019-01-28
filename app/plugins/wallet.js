import Vue from 'vue'
import WalletService from '~/class/WalletService'
import PluginStore from '~/class/PluginStore'

Vue.use(WalletService, {
    store: new PluginStore({
        // TODO Remove these variables as they are temporary hacks for scope
        public: false,
        namespaceAvailable: false,
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
        publicAccount: {},
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
    })
})