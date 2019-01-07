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
import PluginStore from '~/services/PluginStore'

export default {
    Store: PluginStore,
    install: (Vue, options) => {
        Vue.mixin({
            beforeCreate() {
                this.$account.$store = options.store
            }
        })
        Vue.prototype.$account = {
            $store: {},

            regenerateAccount(privateKey, network) {
                console.debug('F:RA:Regenerate Account')
                this.$store.state.account = Account.createFromPrivateKey(privateKey, network.byte)
                console.debug('F:Result')
                console.debug(this.$store.state.account)
            },
            /**
             * NEW AENC WALLET
             * 
             * @param {} networkIdentifier
             */
            newAencAccount(network) {
                console.debug('F:NAW:New Aenc Wallet')
                console.debug('network: ' + network)
                console.debug('___End parameters___')
                this.$store.state.account = Account.generateNewAccount(network.identifier)
                return this.$store.state.account
            },
            /**
             * OPEN AENC WALLET
             * 
             * @param {*} walletName 
             * @param {*} walletPassword 
             * @param {*} privateKey 
             * @param {*} networkIdentifierByte 
             */
            openAencWallet(walletName, walletPassword, privateKey, network) {
                console.debug('F:OAW:Open Aenc Wallet')
                console.debug('network: ' + network)
                console.debug('walletName: ' + walletName)
                console.debug('privateKey: ' + privateKey)
                console.debug('walletPassword: ' + walletPassword)
                console.debug('___End parameters___')

                let wallet = SimpleWallet.createFromPrivateKey(
                    walletName,
                    new Password(walletPassword),
                    privateKey,
                    network.byte)

                this.$store.state.wallet = wallet
                console.log(wallet)
                this.isWalletOnChain(wallet.address.address)

                // this.$store.state.publicAccount = PublicAccount.createFromPublicKey(wallet.publicKey, wallet.address.networkType)
                console.debug('OAW:Result')
                console.debug(wallet)

                return wallet
            },
            /**
             * 
             */
            getBalance() {
                console.debug('F:GB:Get Balance')
                var context = this
                this.$store.state.services.mosaicService
                    .mosaicsAmountViewFromAddress(this.$store.state.wallet.address)
                    .pipe(
                        mergeMap((_) => _)
                    )
                    .subscribe(
                        mosaic => {
                            console.debug('GB:Result: ' + mosaic.relativeAmount())
                            console.debug(mosaic)
                            context.$store.state.meta.balance = mosaic.relativeAmount()
                        },
                        error => {
                            console.log(error)
                        }
                    )
            },
            /**
             * 
             */
            incomingTransactions() {
                console.debug('F:IT:Incoming Transactions')
                var context = this
                console.debug(this.$store.state.accountInfo)
                this.$store.state.services.accountHttp.incomingTransactions(
                        this.$store.state.publicAccount
                    )
                    .subscribe(transactions => {
                        console.debug('IT:R')
                        console.debug(transactions)
                        context.$store.state.userTransactions.incoming = transactions
                    })
            },
            /**
             * 
             */
            outgoingTransactions() {
                var context = this
                this.$store.state.services.accountHttp.outgoingTransactions(
                        this.$store.state.publicAccount
                    )
                    .subscribe(transactions => {
                        context.$store.state.userTransactions.outgoing = transactions
                    })
            },
            /**
             * 
             */
            unconfirmedTransactions() {
                var context = this
                this.$store.state.services.accountHttp.unconfirmedTransactions(
                        this.$store.state.publicAccount
                    )
                    .subscribe(transactions => {
                        console.log(transactions)
                        context.$store.state.userTransactions.unconfirmed = transactions
                    })
            },
            /**
             * This function is just a facade for jobs that will run regularly. It is abstracted in to it's own
             * function because it is used independently and with interval
             */
            walletListeners() {
                console.debug('F:WL:Wallet Listeners')
                this.getBalance()
                this.historicalTransactions()
                this.incomingTransactions()
                this.outgoingTransactions()
                this.unconfirmedTransactions()
            },
            /**
             *
             */
            startListeners() {
                console.debug('F:SL:Start Listeners: Interval time of ' + this.$store.state.intervalTime + 'ms')
                this.walletListeners()
                this.intervalReference = setInterval(this.walletListeners.bind(this), this.$store.state.intervalTime)
            },
            /**
             * 
             * @param {*} blockchainAddress 
             */
            historicalTransactions() {
                console.log('F:HT:Historical Transactions')

                this.$store.state.services.accountHttp
                    .transactions(this.$store.state.publicAccount, new QueryParams(this.$store.state.query.resultSize))
                    .subscribe(transactions => {
                        this.$store.state.userTransactions.historical = transactions
                    }, err => {
                        console.error(err)
                    })

            },
            /**
             * 
             * @param {*} transferInformation 
             */
            aenTransfer(transferInformation) {
                console.debug('F:T:Transfer')
                console.debug(transferInformation)
                console.debug('___End parameters___')

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
            },
            /**
             * 
             * @param {*} endpointAddress 
             */
            updateActiveApiEndpoint(endpointAddress) {
                if (endpointAddress !== this.apiEndpoint) {
                    this.$store.state.apiEndpoint = endpointAddress
                    this.$store.state.services.accountHttp = new AccountHttp(endpointAddress)
                    this.$store.state.services.mosaicHttp = new MosaicHttp(endpointAddress)
                    this.$store.state.services.namespaceHttp = new NamespaceHttp(endpointAddress)
                    this.$store.state.services.mosaicService = new MosaicService(
                        this.$store.state.services.accountHttp,
                        this.$store.state.services.mosaicHttp,
                        this.$store.state.services.namespaceHttp
                    )
                    this.$store.state.services.transactionHttp = new TransactionHttp(endpointAddress)
                }
            },
            /**
             * Check if the address can be found on the live blockchain
             */
            isWalletOnChain(address) {
                console.debug('F:IWOC:Is Wallet On Chain: ' + address)

                var context = this
                var addressObject = Address.createFromRawAddress(address)
                console.log(addressObject)
                try {
                    var result = this.$store.state.services.accountHttp.getAccountInfo(addressObject)
                        .subscribe((AccountInfo) => {
                                context.$store.state.onChain = true
                                console.debug('IWOC: Found account on blockchain')
                                console.debug(AccountInfo)
                            },
                            error => {
                                context.$store.state.onChain = false
                                console.debug(error)
                                // Don't do anything, we are expecting 404 as possible response
                            })
                } catch (e) {
                    // Error is expected
                }
                return result
            },
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
            },
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
    }
}