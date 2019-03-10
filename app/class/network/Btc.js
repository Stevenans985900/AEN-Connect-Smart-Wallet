import bitcoin from 'bitcoinjs-lib'
import axios from 'axios'
import Generic from './Generic.js'

export default class Btc extends Generic {
  /**
   * START OF CUSTOM METHODS
   */
  getTransactionInfo(transactionHash) {
    return new Promise((resolve, reject) => {
      const address = this.blockchainInfoEndpoint + 'rawtx/' + transactionHash
      axios.get(address)
        .then(function (response) {
          console.log(response)
          resolve(response.data)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }
  /**
   * START OF COMMON METHODS
   */

  constructor(apiEndpoint, config) {
    super()
    this.config = config
    this.apiEndpoint = apiEndpoint
    this.context = null
    this.pluginName = 'Btc'
  }
  /**
   * @param options
   * @returns {Subscription}
   */
  balance(options) {
    super.balance(options)
    return new Promise((resolve, reject) => {
      const address = this.apiEndpoint + options.network.block_cypher_id + '/addrs/' + options.address + '/balance'
      axios.get(address)
        .then(function (response) {
          resolve(response.data.balance)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }
  setContext(context) { this.context = context }
  getHeight() {
    return new Promise((resolve, reject) => {
      axios.get(this.apiEndpoint + this.context.block_cypher_id)
          .then((response) => {
            console.log(response)
              resolve(response.data.height)
          })
          .catch((err) => { reject(err) })
    })
  }
  /**
   * @param options
   */
  getLiveWallet(options) {
    super.getLiveWallet(options)
    return new Promise((resolve) => {
      const address = this.apiEndpoint + options.network.block_cypher_id + '/addrs/' + options.address
      axios.get(address)
        .then(function (response) {
          console.log(response.data)
          if(response.data.total_received === 0) {
            resolve(false)
          }
          resolve(true)
        })
        .catch(() => {
          resolve(false)
        })
    })
  }
  walletNew(options) {
    super.walletNew(options)
    return new Promise((resolve) => {
      const keyPair = bitcoin.ECPair.makeRandom({ network: bitcoin.networks[options.network.identifier] })
      const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: bitcoin.networks[options.network.identifier] })
      const walletObject = {
        network: options.network,
        address: address,
        publicKey: keyPair.publicKey,
        credentials: {
          password: options.password,
          walletImportFormat: keyPair.toWIF(),
        }
      }
      resolve(walletObject)
    })
  }
  /**
   * @param options
   * @returns {SimpleWallet}
   */
  walletLoad(options) {
    super.walletLoad(options)
  }
  /**
   *
   * @param {*} blockchainAddress
   */
  transactionsHistorical(options) {
    super.transactionsHistorical(options)
    return new Promise((resolve, reject) => {
      const address = this.apiEndpoint + options.network.block_cypher_id + '/addrs/' + options.address
      axios.get(address)
        .then(function (response) {
          console.log(response)
          resolve(response.data.txrefs)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }
  /**
   *
   */
  transactionsIncoming(options) {
    super.transactionsIncoming(options)
  }
  /**
   *
   */
  transactionsOutgoing(options) {
    super.transactionsOutgoing(options)
  }
  /**
   *
   */
  transactionsUnconfirmed(options) {
    super.transactionsUnconfirmed(options)
  }
  transfer(options) {
    super.transfer(options)
      return new Promise((resolve, reject) => {
          const key =  bitcoin.ECPair.fromWIF(options.credentials.walletImportFormat, bitcoin.networks[options.source.network.identifier])
          const transactionBuilder = new bitcoin.TransactionBuilder(bitcoin.networks[options.source.network.identifier])
          transactionBuilder.setVersion(1)
          // Find input transaction with money to use in this transaction
          for(let i = 0; i < options.source.transactions.length; i++) {
              if(options.source.transactions[i].value > options.destination.amount) {
                  transactionBuilder.addInput(options.source.transactions[i].tx_hash , 1)
                  break
              }
          }
          transactionBuilder.addOutput(options.destination.address, Number(options.destination.amount))
          transactionBuilder.sign(0, key)
          const builtTransaction = transactionBuilder.build().toHex()
          axios.post(this.apiEndpoint +  options.source.network.block_cypher_id + '/tx/push?token=' + this.config.block_cypher.api_token, {
              tx: builtTransaction
          })
              .then(function (response) {
                  console.log(response)
              })
              .catch(function (error) {
                  reject(error)
              })
      })
  }
}
