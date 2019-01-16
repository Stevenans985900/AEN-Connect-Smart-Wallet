import Generic from './Generic.js'
import Web3 from "web3"

export default class Aen extends Generic{
    constructor(apiEndpoint) {
        super()
        this.pluginName = 'ETH'
        this.web3 = new Web3(apiEndpoint)
    }

    balance(options) {
        Generic.prototype.balance.call(this, options)
        return this.web3.eth.getBalance(options.address)
    }

    transfer(options) {
        Generic.prototype.transfer.call(this, options)

        var rawTransaction = {
            "from": options.source.keystore.id,
            "to": options.destination.address,
            "value": this.web3.utils.toHex(this.web3.utils.toWei(options.destination.amount, "ether")),
            "gas": options.destination.gas,
            "chainId": options.source.network.networkId
        }
        console.debug(rawTransaction)
        // TODO - you are currently working here
    }

    walletLoad(options) {
        Generic.prototype.walletLoad.call(this, options)
    }

    walletNew(options) {
        Generic.prototype.walletNew.call(this, options)
        return this.web3.eth.accounts.create(options.password)
    }
}