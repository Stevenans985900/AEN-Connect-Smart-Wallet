import {
  Account,
  AccountHttp,
  Address,
  BlockchainHttp,
  Deadline,
  MosaicHttp,
  MosaicService,
  NamespaceId,
  NamespaceHttp,
  Password,
  PlainMessage,
  PublicAccount,
  QueryParams,
  RegisterNamespaceTransaction,
  SimpleWallet,
  TransferTransaction,
  TransactionHttp,
  UInt64,
  XEM
} from 'chain-js-sdk'
import Vue from 'vue'
import {
  mergeMap
} from 'rxjs/operators'
import Generic from './Generic.js'
import {format} from "date-fns";

export default class Aen extends Generic {

  /**
   *
   * @param apiEndpoint Network reachable address to use for communication
   * @param config The AEN globals configuration object
   */
  constructor(apiEndpoint, config) {
    super()
    this.apiEndpoint = apiEndpoint
    this.config = config
    this.pluginName = 'AEN'
  }
  accountLoad(options) {
    Vue.$log.debug(this.pluginName + ' Plugin: Account Load', options)
    return new Promise((resolve) => {
      const account = Account.createFromPrivateKey(options.accountPrivateKey, options.network.byte)
      resolve(account)
    })
  }
  /**
     * @param options
     * @returns {Account}
     */
  accountNew(options) {
    return new Promise((resolve) => {
      const account = Account.generateNewAccount(options.network.identifier)
      resolve(account)
    })
  }
  /**
     * @param options
     * @returns {Subscription}
     */
  balance(options) {
    super.balance(options)
    return new Promise((resolve, reject) => {
      const mosaicService = new MosaicService(
        new AccountHttp(this.apiEndpoint),
        new MosaicHttp(this.apiEndpoint),
        new NamespaceHttp(this.apiEndpoint)
      )
      const addressObject = Address.createFromRawAddress(options.address)
      return mosaicService
      .mosaicsAmountViewFromAddress(addressObject)
      .pipe(
        mergeMap(_ => _)
      )
      .subscribe(
        (mosaic) => {
          resolve(mosaic.relativeAmount())
        },
        (error) => {
          Vue.$log.error('Could not get balance', error)
          reject(error)
        }
      )
    })
  }

  /**
   * Get the reported height of the blockchain at the current API point
   */
  getHeight() {
    return new Promise((resolve) => {
      const blockchainHttp = new BlockchainHttp(this.apiEndpoint)
      // Get the network height
      blockchainHttp.getBlockchainHeight()
        .subscribe((height) => {
          resolve(height.lower)
        })
    })
  }

  /**
     * @param options
     */
  getLiveWallet(options) {
    super.getLiveWallet(options)
    return new Promise((resolve) => {
      try {
        const addressObject = Address.createFromRawAddress(options.address)
        const accountHttp = new AccountHttp(this.apiEndpoint)
        return accountHttp.getAccountInfo(addressObject)
          .subscribe(() => {
            resolve(addressObject)
          },
          () => {
            resolve(false)
          })
      } catch (e) {
        resolve(false)
      }
    })
  }
  /**
   *
   * @param options
   * @returns {SimpleWallet}
   */
  walletNew(options) {
    Vue.$log.debug('For AEN: Wallet new = Wallet Load')
    return this.walletLoad(options)
  }
  /**
     * @param options
     * @returns {SimpleWallet}
     */
  walletLoad(options) {
    super.walletLoad(options)
    return new Promise((resolve) => {
      const wallet = SimpleWallet.createFromPrivateKey(
        options.name,
        new Password(options.password),
        options.account.privateKey,
        options.network.byte)

      const walletObject = {
        publicKey: options.account.publicKey,
        address: wallet.address.address.toLowerCase(),
        addressObject: wallet.address,
        network: options.network,
        credentials: {
          password: options.password,
          accountPrivateKey: options.account.privateKey,
          privateKey: wallet.encryptedPrivateKey.encryptedKey,
        }
      }
      resolve(walletObject)
    })
  }
  /**
     *
     * @param {*} blockchainAddress
     */
  transactionsHistorical(options) {
    super.transactionsHistorical(options)

    return new Promise((resolve, reject) => {
      const accountHttp = new AccountHttp(this.apiEndpoint)
      const publicAccount = PublicAccount.createFromPublicKey(options.publicKey, options.network.byte)
      // TODO Edit the page size to use a frontend customised value
      return accountHttp
        .transactions(publicAccount, new QueryParams(25))
        .subscribe((transactions) => {
          let transactionsWorkingObject = {}
          let currentTransaction, timeKey
          for(let transactionCount = 0; transactionCount < transactions.length; transactionCount++) {
            currentTransaction = transactions[transactionCount]
            timeKey = format(currentTransaction.deadline.value, 'YYYY-MM-DD HH:mm')
            transactionsWorkingObject[timeKey] = currentTransaction
          }
          resolve(transactionsWorkingObject)
        }, (err) => {
          reject(err)
        })
    })
  }
  /**
   *
   */
  transactionsIncoming(options) {
    super.transactionsIncoming(options)
    const context = this
    this.$store.state.services.accountHttp.incomingTransactions(
      this.$store.state.publicAccount
    )
      .subscribe((transactions) => {
        context.$store.state.userTransactions.incoming = transactions
      })
  }
  /**
   *
   */
  transactionsOutgoing(options) {
    super.transactionsOutgoing(options)
    const context = this
    this.$store.state.services.accountHttp.outgoingTransactions(
      this.$store.state.publicAccount
    )
      .subscribe((transactions) => {
        context.$store.state.userTransactions.outgoing = transactions
      })
  }
  /**
   *
   */
  transactionsUnconfirmed(options) {
    super.transactionsUnconfirmed(options)
    return new Promise((resolve) => {
      const accountHttp = new AccountHttp(this.apiEndpoint)
      const publicAccount = PublicAccount.createFromPublicKey(options.publicKey, options.network.byte)
      accountHttp.unconfirmedTransactions(publicAccount)
        .subscribe((transactions) => {
          resolve(transactions)
          // TODO update here
          Vue.$log.debug(transactions)
        })
    })
  }
  /**
   *
   * @param options
   */
  transfer(options) {
    super.transfer(options)
    return new Promise((resolve) => {
      // Transaction data preparation
      const recipientAddress = Address.createFromRawAddress(options.destination.address)
      const account = Account.createFromPrivateKey(options.credentials.accountPrivateKey, options.source.network.byte)
      const transactionHttp = new TransactionHttp(this.apiEndpoint)
      const message = options.destination.message || ''

      // Prepare base transaction object
      const transferTransaction = TransferTransaction.create(
        Deadline.create(23),
        recipientAddress,
        [XEM.createRelative(parseInt(options.destination.amount))],
        PlainMessage.create(message),
        options.source.network.byte)

      // Sign and send
      const signedTransaction = account.sign(transferTransaction)
      transactionHttp
        .announce(signedTransaction)
        .subscribe(x => resolve(x), err => Vue.$log.error(err))
    })
  }
  /**
   *
   * @param {*} namespaceDefinition
   */
  registerNamespace(options) {
    Vue.$log.debug('AEN Plugin: Register Namespace', options)

    return new Promise((resolve, reject) => {
      const transactionHttp = new TransactionHttp(this.apiEndpoint)
      const account = this.accountLoad({
        accountPrivateKey: options.credentials.accountPrivateKey,
        network: options.wallet.network
      })
      const registerNamespaceTransaction = RegisterNamespaceTransaction.createRootNamespace(
        Deadline.create(),
        options.name,
        UInt64.fromUint(parseInt(options.duration)),
        this.$store.state.wallet.network)

      const signedTransaction = account.sign(registerNamespaceTransaction)

      transactionHttp
        .announce(signedTransaction)
        .subscribe((x) => {
            resolve(x)
          },
          (err) => {
            reject(err)
          })
    })
  }
  /**
   *
   * @param {*} name
   */
  isNamespaceAvailable(name) {
    Vue.$log.debug('AEN Plugin: Is Namespace Available', name)

    return new Promise((resolve) => {
      const nameSpaceHttp = new NamespaceHttp(this.apiEndpoint)
      const namespaceId = new NamespaceId(name)
      nameSpaceHttp.getNamespace(namespaceId)
        .subscribe(
          () => { resolve(false) },
          () => { resolve(true) }
        )
    })
  }
}
