import Generic from './Generic.js'
import Web3 from "web3"
import axios from "axios"

export default class Aen extends Generic {
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
        return new Promise((resolve, reject) => {

            let transaction

            transaction = {
                "from": options.source.address,
                "to": options.destination.address,
                "value": this.web3.utils.toHex(this.web3.utils.toWei(options.destination.amount, "ether")),
                "gas": options.transfer.gas,
                "gasLimit": options.transfer.gasLimit,
                "chainId": options.source.network.network_id
            }

            this.web3.eth.accounts.signTransaction(transaction, options.source.privateKey)
              .then(signedTx => this.web3.eth.sendSignedTransaction(signedTx.rawTransaction))
              .then(receipt => {
                  console.log(receipt)
                  console.log("Transaction receipt: ", receipt)
                  resolve(receipt)
              })
              .catch(err => {
                  console.log('something went wrong when sending a transaction')
                  reject(err)
              })
        })
    }

    /**
     * For Ethereum, check the balance of the account to determine whether or not it is live
     * @param options
     */
    walletIsLive(options) {
        super.walletIsLive(options)
        return new Promise((resolve) => {
            this.balance(options).then(balance => {
                if(balance.toString() !== '0') {
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
            let walletObject = {
                type: 'eth',
                name: options.name,
                password: options.password,
                privateKey: wallet.privateKey,
                address: wallet.address,
                keystore: wallet.encrypt(options.password),
                network: options.network,
                onChain: false
            }
            resolve(walletObject)
        })
    }

    walletNew(options) {
        Generic.prototype.walletNew.call(this, options)
        return new Promise((resolve) => {
            let wallet = this.web3.eth.accounts.create(options.password)
            let walletObject = {
                name: options.name,
                address: wallet.address,
                privateKey: wallet.privateKey,
                keystore: wallet.encrypt(options.password),
                network: options.network,
                type: 'eth',
                password: options.password,
                onChain: false
            }
            resolve(walletObject)
        })
    }
}