import Generic from './Generic.js'
import Web3 from "web3"
import axios from "axios"

export default class Aen extends Generic{
    constructor(apiEndpoint) {
        super()
        this.pluginName = 'ETH'
        this.web3 = new Web3(apiEndpoint)
    }

    balance(options) {
        Generic.prototype.balance.call(this, options)
        return new Promise((resolve) => {
            this.web3.eth.getBalance(options.address).then(wei => {
                console.debug('balance in wei is: '+wei)
                let eth = this.web3.utils.fromWei(wei, 'ether')
                resolve(eth)
            })

        })
    }

    transactionsHistorical(options) {
        super.transactionsHistorical(options)

        return new Promise((resolve) => {
            axios.get(options.wallet.network.etherscan_api_endpoint, {
                params: {
                    module: "account",
                    action: "txlist",
                    address: options.wallet.address,
                    startblock: 0,
                    endblock: 99999999,
                    sort: "desc",
                    apikey: options.etherscan.api_key
                }
            })
              .then(function (response) {
                  console.log(response)
                  resolve(response.data.result)
              })
              .catch(function (error) {
                  console.log(error)
              })
        })

    }

    transfer(options) {
        Generic.prototype.transfer.call(this, options)
        return new Promise((resolve) => {

            // Open up the account
            // let account = this.web3.eth.accounts.decrypt(options.source.keystore, options.source.password)

            var rawTransaction = {
                "from": options.source.address,
                "to": options.destination.address,
                "value": this.web3.utils.toHex(this.web3.utils.toWei(options.destination.amount, "ether")),
                "gas": options.destination.gas,
                "chainId": options.source.network.network_id
            }
            this.web3.eth.accounts.signTransaction(rawTransaction, options.source.privateKey)
              .then(signedTx => this.web3.eth.sendSignedTransaction(signedTx.rawTransaction))
              .then(receipt => {
                  console.log(receipt)
                  console.log("Transaction receipt: ", receipt)
                  resolve(receipt)
              })
              .catch(err => {
                  console.log('something went wrong when sending a transaction')
                  console.error(err)
              })
            console.debug(rawTransaction)
            // TODO - you are currently working here
        })
    }

    /**
     * For Ethereum, check the balance of the account to determine whether or not it is live
     * @param options
     */
    walletIsLive(options) {
        super.walletIsLive(options)
        console.debug('checking whether the wallet is live or not')
        return new Promise((resolve) => {
            this.balance(options).then(balance => {
                if(balance !== 0) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })

    }

    walletLoad(options) {
        super.walletLoad(options)
        return new Promise((resolve) => {
            let wallet = this.web3.eth.accounts.privateKeyToAccount(options.privateKey)
            resolve(wallet)
        })
    }

    walletNew(options) {
        Generic.prototype.walletNew.call(this, options)
        return this.web3.eth.accounts.create(options.password)
    }
}