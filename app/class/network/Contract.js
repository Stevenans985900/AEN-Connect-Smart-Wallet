import Generic from '~/class/network/Generic'
import axios from 'axios'
import Web3 from 'web3'

export default class Contract extends Generic {
  constructor(apiEndpoint) {
    super()
    this.pluginName = 'contract'
    this.web3 = new Web3(apiEndpoint)
  }

  balance(options) {
    super.balance(options)

    return new Promise((resolve, reject) => {
      import('~/class/network/contract/erc20').then((erc20Interface) => {
        const contract = new this.web3.eth.Contract(erc20Interface.abi, options.address)
        contract.methods.balanceOf(options.managerWalletAddress).call().then((response) => {
          resolve(response.balance)
        })
          .catch((err) => {
            console.debug('The contract method does not exist at the remote address')
            reject(err)
          })
      })
    })
  }

  erc20PublicMethod(options) {
    return new Promise((resolve, reject) => {
            import('~/class/network/contract/erc20').then((erc20Interface) => {
              const contract = new this.web3.eth.Contract(erc20Interface.abi, options.contractAddress)
              // TODO Insert parameter handling here
              contract.methods[options.method]().call().then((response) => {
                resolve(response)
              })
                .catch((err) => {
                  console.debug('The contract method does not exist at the remote address')
                  reject(err)
                })
            })
    })
  }

  transactionsHistorical(options) {
    super.transactionsHistorical(options)
    return new Promise((resolve, reject) => {
      axios.get(options.wallet.network.etherscan_api_endpoint, {
        params: {
          module: 'account',
          action: 'txlist',
          address: options.wallet.managerWalletAddress,
          startblock: 0,
          endblock: 99999999,
          sort: 'desc',
          apikey: options.etherscan.api_key
        }
      })
        .then(function (response) {
          // Filter the results by the contract address
          response = response.data.result
          let transactions = []
          for(let transactionKey in response) {
            let transaction = response[transactionKey]
            if(transaction.contractAddress === options.wallet.address) {
              transactions.push(transaction)
            }
          }
          resolve(transactions)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }

  transfer(options) {
    Generic.prototype.transfer.call(this, options)
    return new Promise((resolve) => {
      let transaction
            // TODO Add in the flexibility to handle meta contracts if there is a proxy transfer method
            import('~/class/network/contract/erc20').then((erc20Interface) => {
              const contract = new this.web3.eth.Contract(erc20Interface.abi, options.source.address)
              transaction = contract.methods.transfer(options.destination.address, options.destination.amount)
              transaction.chainId = options.source.network.network_id
              transaction.gas = options.transfer.gasPrice
              transaction.gasLimit = options.transfer.gasLimit

              this.web3.eth.accounts.signTransaction(transaction, options.transfer.managerWallet.privateKey)
                .then(signedTx => this.web3.eth.sendSignedTransaction(signedTx.rawTransaction))
                .then((receipt) => {
                  console.log(receipt)
                  console.log('Transaction receipt: ', receipt)
                  resolve(receipt)
                })
                .catch((err) => {
                  console.log('something went wrong when sending a transaction')
                  console.error(err)
                })
            })
    })
  }

  /**
   * For Ethereum, check the balance of the account to determine whether or not it is live
   * @param options
   */
  getLiveWallet(options) {
    console.log('checking if CONTRACT has some wonga')
    super.getLiveWallet(options)

    return new Promise((resolve) => {
      this.balance(options).then((balance) => {
        if (balance.toString() !== '0') {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
  }
  /**
     * Adoption of ERC20 contracts doesn't involve any initial processing so,
     * just use the opportunity to return properties from the original options
     * object
     * @param options
     * @returns {Promise<any>}
     */
  walletLoad(options) {
    Generic.prototype.walletLoad.call(this, options)

    return new Promise((resolve) => {
      resolve(options)
    })
  }

  walletNew(options) {
    Generic.prototype.walletNew.call(this, options)
    return this.web3.eth.accounts.create(options.password)
  }

  getWeb3() {
    return this.web3
  }
}
