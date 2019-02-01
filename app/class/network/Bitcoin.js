import bitcoin from 'bitcoinjs-lib'
import axios from 'axios'
import Generic from './Generic.js'

export default class Bitcoin extends Generic {
  constructor(apiEndpoints) {
    super()
    this.blockCypherEndpoint = apiEndpoints.blockCypherEndpoint
    this.bitapsEndpoint = apiEndpoints.bitapsEndpoint
    this.pluginName = 'Bitcoin'
  }
  /**
   * @param options
   * @returns {Subscription}
   */
  balance(options) {
    super.balance(options)
    return new Promise((resolve, reject) => {
      const address = this.blockCypherEndpoint + 'v1/btc/' + options.wallet.network.block_cypher_id + '/addrs/' + options.wallet.address
      axios.get(address)
        .then(function (response) {
          console.log('Result from running balance check on blockchain')
          console.log(response)
          resolve(response.balance)
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
      const address = this.blockCypherEndpoint + 'v1/btc/' + options.wallet.network.block_cypher_id + '/addrs/' + options.wallet.address
      axios.get(address)
        .then(function (response) {
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
      console.log(keyPair)
      console.log(bitcoin.networks[options.network.identifier])
      const wallet = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: bitcoin.networks[options.network.identifier] })
      console.log(wallet)
      const walletObject = {
        name: options.name,
        network: options.network,
        type: options.type,
        address: wallet.address,
        walletImportFormat: keyPair.toWIF(),
        publicKey: wallet.publicKey,
        onChain: false
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
