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
      const address = this.blockCypherEndpoint + options.network.block_cypher_id + '/addrs/' + options.address + '/balance'
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
      axios.get(this.config.block_cypher.api_endpoint + this.context.block_cypher_id)
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
      const address = this.blockCypherEndpoint + options.network.block_cypher_id + '/addrs/' + options.address
      axios.get(address)
        .then(function (response) {
          console.log('response from checking for btc address')
          console.log(response)
          resolve(response)
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
      const address = this.blockCypherEndpoint + options.network.block_cypher_id + '/addrs/' + options.address
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
  }
}
