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
    // PublicAccount,
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
import Generic from '~/services/network/Generic.js'


export default class Aen extends Generic {
  constructor() {
    super()
    this.apiEndpoint = ''
    this.pluginName = 'AEN'
  }
    accountLoad(options) {
      console.debug(this.pluginName+' Plugin: Account Load')
      console.debug(options)
      return Account.createFromPrivateKey(options.accountPrivateKey, options.network.byte)
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
      Generic.prototype.balance.call(this, options)
        // let balance
        return this.services.mosaicService
          .mosaicsAmountViewFromAddress(options.address)
          .pipe(
            mergeMap((_) => _)
          )
          .subscribe(
            mosaic => {
                return mosaic.relativeAmount()
            },
            error => {
                console.log(error)
            }
          )
    }
    /**
     * @param options
     */
    walletIsLive(options) {
      Generic.prototype.walletIsLive.call(this, options)
        let addressObject = Address.createFromRawAddress(options.address)
        try {
            return this.services.accountHttp.getAccountInfo(addressObject)
              .subscribe((AccountInfo) => {
                console.debug(AccountInfo)
                return true
                },
                error => {
                    console.debug(error)
                  return false
                  // Don't do anything, we are expecting 404 as possible response
                })
        } catch (e) {
          console.debug(e)
          return false
        }
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
      Generic.prototype.walletLoad.call(this, options)
        return SimpleWallet.createFromPrivateKey(
            options.name,
            new Password(options.password),
            options.accountPrivateKey,
            options.network.byte)
    }
    /**
     *
     * @param {*} blockchainAddress
     */
    transactionsHistorical(options) {
      Generic.prototype.transactionsHistorical.call(this, options)

      this.$store.state.services.accountHttp
        .transactions(this.$store.state.publicAccount, new QueryParams(this.$store.state.query.resultSize))
        .subscribe(transactions => {
          this.$store.state.userTransactions.historical = transactions
        }, err => {
          console.error(err)
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

    var transferInformation = {}

    const recipientAddress = Address.createFromRawAddress(transferInformation.address)
    const transferTransaction = TransferTransaction.create(
      Deadline.create(23),
      recipientAddress,
      [XEM.createRelative(parseInt(transferInformation.amount))],
      PlainMessage.create(transferInformation.message),
      this.$store.state.wallet.network)

    const signedTransaction = this.$store.state.account.sign(transferTransaction)
    this.$store.state.services.transactionHttp
      .announce(signedTransaction)
      .subscribe(x => console.log(x), err => console.error(err))
  }

    /**
     * @param endpointAddress
     */
    updateActiveApiEndpoint(options) {
      Generic.prototype.updateActiveApiEndpoint.call(this, options)

        if (options.address !== this.apiEndpoint) {
            this.apiEndpoint = options.address
            this.services.accountHttp = new AccountHttp(options.address)
            this.services.mosaicHttp = new MosaicHttp(options.address)
            this.services.namespaceHttp = new NamespaceHttp(options.address)
            this.services.mosaicService = new MosaicService(
              this.services.accountHttp,
              this.services.mosaicHttp,
              this.services.namespaceHttp
            )
            this.services.transactionHttp = new TransactionHttp(options.address)
        }
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