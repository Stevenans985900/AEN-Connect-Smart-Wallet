import Vue from 'vue'
import Web3 from 'web3'
import axios from 'axios'
import Generic from './Generic.js'
import {format} from "date-fns";
import EthereumTx from 'ethereumjs-tx'
import $g from '~/globals.json'

export default class Eth extends Generic {
  constructor(apiEndpoint, config) {
    super()
    this.pluginName = 'ETH'
    this.config = config
    this.web3 = new Web3(apiEndpoint)
  }
  balance(options) {
    super.balance(options)
    return new Promise((resolve) => {
      this.web3.eth.getBalance(options.address).then((wei) => {
        resolve(wei)
      })
    })
  }

  async erc20PublicMethod(options) {
    Vue.$log.debug('ETH Plugin: ERC20 Method', options)
    return new Promise((resolve) => {
      import('~/class/network/contract/erc20').then((erc20Interface) => {
        const contract = new this.web3.eth.Contract(erc20Interface.abi, options.contractAddress)
        contract.methods[options.method]().call().then((response) => {
          resolve(response)
        })
      })
    })
  }

  /**
   * TODO Rename this function to use the standardised version from the Generic
   * @param address
   * @returns {Promise<any>}
   */
  receipt(address) {
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
          startblock: options.startBlock || 0,
          endblock: 99999999,
          sort: 'desc',
          apikey: this.config.etherscan.api_key
        }
      })
        .then(async function (response) {
          Vue.$log.debug('ETH: Transactions Historical: Axios return object', response)
          let transactionsWorkingObject = {}
          let currentTransaction, timeKey
          const transactions = response.data.result
          for(let transactionCount = 0; transactionCount < transactions.length; transactionCount++) {
            currentTransaction = transactions[transactionCount]
            timeKey = format((currentTransaction.timeStamp * 1000), 'YYYY-MM-DD HH:mm')
            transactionsWorkingObject[timeKey] = currentTransaction
          }
          Vue.$log.debug('ETH: Transactions Historical: Working Transactions object', transactionsWorkingObject)
          resolve(transactionsWorkingObject)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }

  /**
   *
   * @param transactionHash
   * @returns {Promise<{transactionBlock: number, currentBlock: number, transactionHash: *}>}
   */
  async transactionStatus(options) {
    Vue.$log.debug('ETH Plugin: Transaction Status', options)
    const transaction = await this.web3.eth.getTransaction(options.txHash)
    const currentBlock = await this.web3.eth.getBlockNumber()
    const result = {
      currentBlock: currentBlock,
      transactionBlock: transaction.blockNumber
    }

    // When transaction is unconfirmed, its block number is null.
    // In this case we return 0 as number of confirmations
    const blocksConfirmed = transaction.blockNumber === null ? 0 : currentBlock - transaction.blockNumber
    if(blocksConfirmed > $g.eth.transaction_blocks_confirmed) {
      result.status = 'CONFIRMED'
    } else {
      result.status = 'PENDING'
    }
    return result
  }

    transfer(options) {
      Generic.prototype.transfer.call(this, options)
      return new Promise((resolve) => {
        const privateKey = Buffer.from(options.credentials.privateKey.substring(2), 'hex')

        // TODO Add in split to handle different chainId depending on the network for this wallet
        this.web3.eth.getTransactionCount(options.source.address, 'pending').then((nonce) => {
          const txParams = {
            nonce: this.web3.utils.toHex(nonce),
            gasPrice: this.web3.utils.toHex(options.transfer.gasPrice),
            gas: this.web3.utils.toHex(options.transfer.gas),
            gasLimit: this.web3.utils.toHex(options.transfer.gasLimit),
            to: options.destination.address,
            value: this.web3.utils.toHex(options.destination.amount),
            chainId: 3
          }
          const tx = new EthereumTx(txParams)
          tx.sign(privateKey)
          const serializedTx = tx.serialize()

          // const meth =
          this.web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'))
            .on('transactionHash', function(hash){
              Vue.$log.debug('Have transaction hash from web3', hash)

              const transaction = {
                txHash: hash,
                direction: 'outgoing',
                address: options.destination.address,
                amount: options.destination.amount,
                type: options.source.type,
                walletAddress: options.source.address,
                network: options.source.network.identifier,
                status: 'PENDING'
              }

              resolve(transaction)
            })
            .on('error', function(err){ Vue.$log.error(err) })
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
        address: wallet.address.toLowerCase(),
        network: options.network,
        startBlock: 0,
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
        address: wallet.address.toLowerCase(),
        network: options.network,
        startBlock: 0,
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
