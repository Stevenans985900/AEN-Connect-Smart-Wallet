import Generic from './Ethereum.js'
import Web3 from "web3"
import axios from "axios"

export default class Erc20 extends Generic {

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