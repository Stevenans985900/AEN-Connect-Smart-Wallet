import {
    Account,
    AccountHttp,
    Address,
    Deadline,
    MosaicHttp,
    NamespaceHttp,
    NamespaceId,
    MosaicService,
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
      console.debug(this.pluginName+' Plugin: Account Load')
      console.debug(options)
      return new Promise((resolve) => {
        let account = Account.createFromPrivateKey(options.accountPrivateKey, options.network.byte)
        resolve(account)
      })
    }
    /**
     * @param options
     * @returns {Account}
     */
    accountNew(options) {
      console.debug(this.pluginName+' Plugin: Account New')
      console.debug(options)
      return Account.generateNewAccount(options.network.identifier)
    }
    /**
     * @param options
     * @returns {Subscription}
     */
    balance(options) {

      return new Promise((resolve, reject) => {
        let mosaicService = new MosaicService(
          new AccountHttp(this.apiEndpoint),
          new MosaicHttp(this.apiEndpoint),
          new NamespaceHttp(this.apiEndpoint)
        )
        let addressObject = Address.createFromRawAddress(options.address)

        Generic.prototype.balance.call(this, options)
        // let balance
        return mosaicService
          .mosaicsAmountViewFromAddress(addressObject)
          .pipe(
            mergeMap((_) => _)
          )
          .subscribe(
            mosaic => {
              resolve(mosaic.relativeAmount())
            },
            error => {
              reject(error)
            }
          )
      })
    }
    /**
     * @param options
     */
    walletIsLive(options) {
      Generic.prototype.walletIsLive.call(this, options)
      return new Promise((resolve) => {
      try {
        let addressObject = Address.createFromRawAddress(options.address)
          let accountHttp = new AccountHttp(this.apiEndpoint)
            return accountHttp.getAccountInfo(addressObject)
              .subscribe((AccountInfo) => {
                console.debug(AccountInfo)
                resolve(true)
                },
               error => {
                 console.debug('Wallet not yet recognised on the chain')
                    console.debug(error)
                  resolve(false)
                  // Don't do anything, we are expecting 404 as possible response
                })
        } catch (e) {
          console.debug('Wallet not yet recognised on the chain')
          console.debug(e)
          resolve(false)
        }
    })
    }
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
        let wallet = SimpleWallet.createFromPrivateKey(
          options.name,
          new Password(options.password),
          options.account.privateKey,
          options.network.byte)

        let walletObject = {
          password: options.password,
          accountPrivateKey: options.account.accountPrivateKey,
          privateKey: wallet.encryptedPrivateKey.encryptedKey,
          publicKey: options.account.publicKey,
          address: wallet.address.address,
          network: options.network
        }
        resolve(walletObject)
      })
    }
    /**
     *
     * @param {*} blockchainAddress
     */
    transactionsHistorical(options) {
      Generic.prototype.transactionsHistorical.call(this, options)

      return new Promise((resolve, reject) => {
        let accountHttp = new AccountHttp(this.apiEndpoint)
        let publicAccount = PublicAccount.createFromPublicKey(options.publicKey, options.network.byte)
        // TODO Edit the page size to use a frontend customised value
        return accountHttp
          .transactions(publicAccount, new QueryParams(25))
          .subscribe(transactions => {
            resolve(transactions)
            // this.$store.state.userTransactions.historical = transactions
          }, err => {
            reject(err)
          })
      })

    }
  /**
   *
   */
  transactionsIncoming(options) {
    Generic.prototype.transactionsIncoming.call(this, options)
    var context = this
    this.$store.state.services.accountHttp.incomingTransactions(
      this.$store.state.publicAccount
    )
      .subscribe(transactions => {
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
    var context = this
    this.$store.state.services.accountHttp.outgoingTransactions(
      this.$store.state.publicAccount
    )
      .subscribe(transactions => {
        context.$store.state.userTransactions.outgoing = transactions
      })
  }
  /**
   *
   */
  transactionsUnconfirmed(options) {
    Generic.prototype.transactionsUnconfirmed.call(this, options)
    var context = this
    this.$store.state.services.accountHttp.unconfirmedTransactions(
      this.$store.state.publicAccount
    )
      .subscribe(transactions => {
        console.log(transactions)
        context.$store.state.userTransactions.unconfirmed = transactions
      })
  }
  transfer(options) {
    Generic.prototype.transfer.call(this, options)

    const recipientAddress = Address.createFromRawAddress(options.destination.address)
    const account = Account.createFromPrivateKey(options.source.accountPrivateKey, options.source.network.byte)
    const transactionHttp = new TransactionHttp(this.apiEndpoint)
    let message = options.destination.message || ''

    const transferTransaction = TransferTransaction.create(
      Deadline.create(23),
      recipientAddress,
      [XEM.createRelative(parseInt(options.destination.amount))],
      PlainMessage.create(message),
      options.source.network.byte)

    const signedTransaction = account.sign(transferTransaction)
    transactionHttp
      .announce(signedTransaction)
      .subscribe(x => console.log(x), err => console.error(err))
  }

    /**
     * @param endpointAddress
     */
    updateApiEndpoint(options) {
      Generic.prototype.updateApiEndpoint.call(this, options)

        if (options.address !== this.apiEndpoint) {
          console.debug('Refreshing HTTP services')
            this.apiEndpoint = options.address
            // this.services.accountHttp = new AccountHttp(options.address)
            // this.services.mosaicHttp = new MosaicHttp(options.address)
            // this.services.namespaceHttp = new NamespaceHttp(options.address)
            // this.services.mosaicService = new MosaicService(
            //   this.services.accountHttp,
            //   this.services.mosaicHttp,
            //   this.services.namespaceHttp
            // )
            // this.services.transactionHttp = new TransactionHttp(options.address)
        }
        console.log(this.services)
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
      this.$store.state.wallet.network);

    const signedTransaction = this.$store.state.account.sign(registerNamespaceTransaction);

    this.$store.state.services.transactionHttp
      .announce(signedTransaction)
      .subscribe(x => {
          console.log(x)
        },
        err => {
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
    var context = this
    this.$store.state.services.namespaceHttp
      .getNamespace(namespaceId)
      .subscribe(
        namespace => {
          context.$store.state.namespaceAvailable = false
          console.log('INA:Result')
          console.log(namespace)
        },
        err => {
          context.$store.state.namespaceAvailable = true
          console.log(err)
        }
      )
  }
}