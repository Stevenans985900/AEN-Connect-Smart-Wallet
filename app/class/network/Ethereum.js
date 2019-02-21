import Web3 from 'web3'
import axios from 'axios'
import Generic from './Generic.js'

export default class Aen extends Generic {
  constructor(apiEndpoint) {
    super()
    this.pluginName = 'ETH'
    this.web3 = new Web3(apiEndpoint)
  }

  balance(options) {
    Generic.prototype.balance.call(this, options)
    return new Promise((resolve) => {
      this.web3.eth.getBalance(options.address).then((wei) => {
        const eth = this.web3.utils.fromWei(wei, 'ether')
        resolve(eth)
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
          address: options.wallet.address,
          startblock: 0,
          endblock: 99999999,
          sort: 'desc',
          apikey: options.etherscan.api_key
        }
      })
        .then(function (response) {
          resolve(response.data.result)
        })
        .catch(function (error) {
          reject(error)
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
                "gasPrice": this.web3.utils.toHex(options.transfer.gasPrice),
                "gas": this.web3.utils.toHex(options.transfer.gas),
                "gasLimit": this.web3.utils.toHex(options.transfer.gasLimit),
                "chainId": options.source.network.network_id
            }

      this.web3.eth.accounts.signTransaction(transaction, options.source.privateKey)
        .then(signedTx => this.web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then((receipt) => {
          console.log(receipt)
          console.log('Transaction receipt: ', receipt)
          resolve(receipt)
        })
        .catch((err) => {
          console.log('something went wrong when sending a transaction')
          reject(err)
        })
    })
  }

  /**
     * For Ethereum, check the balance of the account to determine whether or not it is live
     * @param options
     */
  getLiveWallet(options) {
    super.getLiveWallet(options)
    return new Promise((resolve) => {
      this.balance(options).then((balance) => {
        if (balance.toString() !== '0') {
          resolve(balance)
        } else {
          resolve(false)
        }
      })
    })
  }

  walletLoad(options) {
    super.walletLoad(options)
    return new Promise((resolve) => {
      const wallet = this.web3.eth.accounts.privateKeyToAccount(options.privateKey)
      const walletObject = {
        address: wallet.address,
        network: options.network,
        credentials: {
          keystore: wallet.encrypt(options.password),
          password: options.password,
          privateKey: wallet.privateKey
        }
      }
      resolve(walletObject)
    })
  }

  walletNew(options) {
    Generic.prototype.walletNew.call(this, options)
    return new Promise((resolve) => {
      const wallet = this.web3.eth.accounts.create(options.password)
      const walletObject = {
        address: wallet.address,
        network: options.network,
        credentials: {
          keystore: wallet.encrypt(options.password),
          password: options.password,
          privateKey: wallet.privateKey
        }
      }
      resolve(walletObject)
    })
  }
}
