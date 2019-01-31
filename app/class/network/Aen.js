import {
  Account,
  AccountHttp,
  Address,
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

import {
  mergeMap
} from 'rxjs/operators'
import Generic from './Generic.js'

export default class Aen extends Generic {
  constructor(apiEndpoint) {
    super()
    this.apiEndpoint = apiEndpoint
    this.pluginName = 'AEN'
  }
  accountLoad(options) {
    console.debug(this.pluginName + ' Plugin: Account Load')
    console.debug(options)
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
          reject(error)
        }
      )
    })
  }
  /**
     * @param options
     */
  walletIsLive(options) {
    super.walletIsLive(options)
    return new Promise((resolve) => {
      try {
        const addressObject = Address.createFromRawAddress(options.address)
        const accountHttp = new AccountHttp(this.apiEndpoint)
        return accountHttp.getAccountInfo(addressObject)
          .subscribe(() => {
            resolve(true)
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
    console.debug('For AEN: Wallet new = Wallet Load')
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
        onChain: false,
        name: options.name,
        balance: 0,
        password: options.password,
        accountPrivateKey: options.account.privateKey,
        privateKey: wallet.encryptedPrivateKey.encryptedKey,
        publicKey: options.account.publicKey,
        address: wallet.address.address,
        network: options.network,
        type: 'aen'
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
          resolve(transactions)
          // this.$store.state.userTransactions.historical = transactions
        }, (err) => {
          reject(err)
        })
    })
  }
  /**
   *
   */
  transactionsIncoming(options) {
    Generic.prototype.transactionsIncoming.call(this, options)
    const context = this
    this.$store.state.services.accountHttp.incomingTransactions(
      this.$store.state.publicAccount
    )
      .subscribe((transactions) => {
        console.debug('IT:R')
        console.debug(transactions)
        context.$store.state.userTransactions.incoming = transactions
      })
  }
  /**
   *
   */
  transactionsOutgoing(options) {
    Generic.prototype.transactionsOutgoing.call(this, options)
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
    Generic.prototype.transactionsUnconfirmed.call(this, options)
    const context = this
    this.$store.state.services.accountHttp.unconfirmedTransactions(
      this.$store.state.publicAccount
    )
      .subscribe((transactions) => {
        console.log(transactions)
        context.$store.state.userTransactions.unconfirmed = transactions
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
      const account = Account.createFromPrivateKey(options.source.accountPrivateKey, options.source.network.byte)
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
        .subscribe(x => resolve(x), err => console.error(err))
    })
  }
  /**
   *
   * @param {*} namespaceDefinition
   */
  registerNamespace(namespaceDefinition) {
    console.log('F:RN:Register Namespace')

    const registerNamespaceTransaction = RegisterNamespaceTransaction.createRootNamespace(
      Deadline.create(),
      namespaceDefinition.name,
      UInt64.fromUint(parseInt(namespaceDefinition.duration)),
      this.$store.state.wallet.network)

    const signedTransaction = this.$store.state.account.sign(registerNamespaceTransaction)

    this.$store.state.services.transactionHttp
      .announce(signedTransaction)
      .subscribe((x) => {
        console.log(x)
      },
      (err) => {
        console.error(err)
      })
  }
  /**
   *
   * @param {*} name
   */
  isNamespaceAvailable(name) {
    console.debug('F:INA:Is Namespace Available with name: ' + name)
    const namespaceId = new NamespaceId(name)
    const context = this
    this.$store.state.services.namespaceHttp
      .getNamespace(namespaceId)
      .subscribe(
        (namespace) => {
          context.$store.state.namespaceAvailable = false
          console.log('INA:Result')
          console.log(namespace)
        },
        (err) => {
          context.$store.state.namespaceAvailable = true
          console.log(err)
        }
      )
  }
}
