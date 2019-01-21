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
            // Determine whether it is a contract
            if(options.hasOwnProperty('contract')) {
                import("~/modules/network/erc20/"+options.destination.contractAddress).then(erc20Interface => {
                    console.log(erc20Interface)
                    let contract = new this.web3.eth.Contract(erc20Interface.abi, options.destination.contractAddress)
                    console.log(contract)

                    // Prepare the function arguments
                    let functionArguments = []
                    let parameterKey, parameterOptions, parameterType, parameterValue
                    for (parameterKey in erc20Interface.availableMethods[options.contract.method].parameters) {
                        parameterOptions = erc20Interface.availableMethods[options.contract.method].parameters[parameterKey]

                        if (options.contract.parameters.hasOwnProperty(parameterKey)) {
                            parameterValue = options.contract.parameters.parameterKey
                            console.log(parameterValue)
                            parameterType = typeof parameterValue

                            if (parameterType !== parameterOptions.type) {
                                reject(parameterKey + " is supposed to be a " + parameterOptions.type + "." + parameterType + " detected")
                            }
                            functionArguments.push(parameterValue)

                        } else {
                            if (parameterOptions.required === true) {
                                reject(parameterKey + " is a required parameter and not set")
                            }
                        }
                    }

                    transaction = contract.methods[options.contract.method].apply(this, functionArguments)
                    transaction.chainId = options.source.network.network_id
                    transaction.gas = options.transfer.gas
                    transaction.gasLimit = options.transfer.gasLimit,

                    this.web3.eth.accounts.signTransaction(transaction, options.source.privateKey)
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
                })
            }

            if(options.hasOwnProperty('destination')) {
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
                      console.error(err)
                  })
            }
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