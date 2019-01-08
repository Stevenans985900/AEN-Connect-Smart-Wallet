import Generic from '~/services/network/Generic.js'
import Web3 from "web3"

export default class Aen extends Generic{
    constructor(apiEndpoint) {
        super()
        this.pluginName = 'ETH'
        this.web3 = new Web3(apiEndpoint)
    }

    walletNew(options) {
        Generic.prototype.walletNew.call(this, options)
        // TODO Once have process working, switch the create account to use the API version
        return this.web3.eth.accounts.create()
    }
}