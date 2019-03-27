import bitcoin from 'bitcoinjs-lib'
import axios from 'axios'
import Generic from './Generic.js'
import bip32 from 'bip32'
import bip39 from 'bip39'
import { format } from 'date-fns'

async function asyncForEach(input, callback) {
  for (let key in input) {
    await callback(key, key, input);
  }
}

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
  receieverAddress(options) {
    console.debug('BTC Plugin: Receiver Address')
    console.debug(options)
    return new Promise((resolve, reject) => {
      if (bip39.validateMnemonic(options.mnemonic) === false) {
        reject('MNEMONIC_GENERATE_ERROR')
      }
      const seed = bip39.mnemonicToSeed(options.mnemonic)
      const root = bip32.fromSeed(seed)

      // Work out the coin index to use when deriving an address
      let coinIndex = '1'
      if (options.wallet.network.hasOwnProperty('testing')) {
        coinIndex = '2'
      }
      const path = "m/44'/" + coinIndex + "'/0'/0/" + options.wallet.currentBipIndex
      const child = root.derivePath(path)

      const rootAddress = bitcoin.payments.p2pkh({
            pubkey: child.publicKey,
            network: bitcoin.networks[options.wallet.network.identifier]
          }
      ).address
      resolve(rootAddress)
    })
  }
  /**
   * @param options
   * @returns {Subscription}
   */
  async balance(options) {
    super.balance(options)

    const output = {
      wallets: {},
      balance: 0
    }
    await asyncForEach(options.managedAddressesWithTokens, async (address) => {
      let { data } = await axios.get(
          this.apiEndpoint + options.network.block_cypher_id + '/addrs/' + address + '/balance'
      )
      console.log('upping balance by: ' + data.balance)
      output.balance += data.balance
      output.wallets[address] = data.balance
    })
    console.log('returning', output)
    return output
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
    return new Promise((resolve, reject) => {
      // Generate a mnemonic to use
      const mnemonic = bip39.generateMnemonic()
      if(bip39.validateMnemonic(mnemonic) === false) {
        reject('MNEMONIC_GENERATE_ERROR')
      }
      const seed = bip39.mnemonicToSeed(mnemonic)
      const root = bip32.fromSeed(seed)

      // Work out the coin index to use when deriving an address
      let coinIndex = '1'
      if(options.network.hasOwnProperty('testing')) {
        coinIndex = '2'
      }
      const path = "m/44'/" + coinIndex + "'/0'/0/0"
      const child = root.derivePath(path)

      const rootAddress = bitcoin.payments.p2pkh({
        pubkey: child.publicKey,
        network: bitcoin.networks[options.network.identifier] }
      ).address

      const receiverPath = "m/44'/" + coinIndex + "'/0'/0/1"
      const receiverChild = root.derivePath(receiverPath)

      const receiverAddress = bitcoin.payments.p2pkh({
        pubkey: receiverChild.publicKey,
        network: bitcoin.networks[options.network.identifier] }
      ).address

      const walletObject = {
        network: options.network,
        address: rootAddress,
        currentBipIndex: 1,
        receiverAddress: receiverAddress,
        managedAddressesWithTokens: {},
        credentials: {
          password: options.password,
          mnemonic: mnemonic,
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
    return new Promise((resolve) => {

      resolve({
        network: options.network,
        address: options.address,
        currentBipIndex: options.currentBipIndex,
        managedAddressesWithTokens: options.managedAddressesWithTokens,
        receiverAddress: options.receiverAddress,
        credentials: {
          password: options.password,
          mnemonic: options.mnemonic
        }
      })
    })
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
          let transactions = {}
          let currentTransaction, timeKey
          for(let transactionCount = 0; transactionCount < response.data.txrefs.length; transactionCount++) {
            currentTransaction = response.data.txrefs[transactionCount]
            timeKey = format(currentTransaction.confirmed, 'YYYY-MM-DD HH:mm')
            transactions[timeKey] = currentTransaction
          }
          resolve(transactions)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }

  /**
   * Transaction Information
   * Gets detailed information about a given transaction seeing as the transaction listing itself is quite light
   */
  transactionInfo(options) {
    console.debug('BTC Plugin: Transaction Info', options)
    return new Promise((resolve) => {
      const address = this.apiEndpoint + options.network.block_cypher_id + '/txs/' + options.hash
      axios.get(address)
        .then((response) => {
          resolve(response.data)
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
