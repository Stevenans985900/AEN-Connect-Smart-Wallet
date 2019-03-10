import Web3 from 'web3'
import axios from 'axios'
import Generic from './Generic.js'

export default class Aen extends Generic {
  constructor(apiEndpoint, config) {
    super()
    this.pluginName = 'ETH'
    this.config = config
    this.web3 = new Web3(apiEndpoint)
  }
  balance(options) {
    super.balance(options)
    return new Promise((resolve) => {
      console.log('goes wrong here')
      this.web3.eth.getBalance(options.address).then((wei) => {
        console.log('BALANCE from network: ' + wei)
        resolve(wei)
      })
    })
  }

  receipt(address) {
    console.debug('Ethereum Plugin: Receipt')
    return new Promise((resolve, reject) => {
      this.web3.eth.getTransactionReceipt(address)
        .then((receipt) => { resolve(receipt) })
        .catch((err) => { reject(err) })
    })
  }

  transactionsHistorical(options) {
    super.transactionsHistorical(options)

    const apiEndpoint = this.config.etherscan.api_endpoint.replace('###NETWORK_IDENTIFIER###', options.network.identifier)
    return new Promise((resolve, reject) => {
      axios.get(apiEndpoint, {
        params: {
          module: 'account',
          action: 'txlist',
          address: options.address,
          startblock: 0,
          endblock: 99999999,
          sort: 'desc',
          apikey: this.config.etherscan.api_key
        }
      })
        .then(function (response) {
          resolve(response.data.result)
        })
        .catch(function (error) {
          console.debug(error)
          reject([])
        })
    })
  }

    transfer(options) {
        Generic.prototype.transfer.call(this, options)
        return new Promise((resolve, reject) => {

            const transaction = {
                "from": options.source.address,
                "to": options.destination.address,
                "value": this.web3.utils.toHex(this.web3.utils.toWei(options.destination.amount, "ether")),
                "gasPrice": this.web3.utils.toHex(options.transfer.gasPrice),
                "gas": this.web3.utils.toHex(options.transfer.gas),
                "gasLimit": this.web3.utils.toHex(options.transfer.gasLimit),
                "chainId": options.source.network.network_id
            }

      this.web3.eth.accounts.signTransaction(transaction, options.credentials.privateKey)
        .then(signedTx => this.web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then((receipt) => {
          resolve(receipt)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  getHeight() {
    return new Promise((resolve) => {
      this.web3.eth.getBlockNumber().then((height) => {
        resolve(height)
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
  setProvider(endpoint) { this.web3.setProvider(endpoint) }
  web3() { return this.web3 }
}
