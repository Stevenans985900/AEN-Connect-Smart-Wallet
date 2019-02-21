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

  constructor(btcConfig) {
    super()
    this.blockchainInfoEndpoint = btcConfig.blockchain_info.api_endpoint
    this.blockCypherEndpoint = btcConfig.block_cypher.api_endpoint
    this.bitapsEndpoint = btcConfig.bitaps.api_endpoint
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
