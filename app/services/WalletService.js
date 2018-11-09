import { Account, AccountHttp, Address, BlockchainHttp, Deadline, MosaicAmountView, MosaicHttp, NamespaceHttp, NamespaceId, MosaicService, NetworkType, Password, PlainMessage, PublicAccount, QueryParams, RegisterNamespaceTransaction, SimpleWallet, TransferTransaction, TransactionHttp, UInt64, XEM } from 'chain-js-sdk'
import { mergeMap } from 'rxjs/operators'
import PluginStore from '~/services/PluginStore'

export default {
	Store: PluginStore,
	install: (Vue, options) => {
		Vue.mixin({
			beforeCreate () {
				this.$account.$store = options.store
			}
		})
		Vue.prototype.$account = {
			$store: {},
			regenerate_account (privateKey, networkType) {
				console.debug('F:RA:Regenerate Account')
				this.$store.state.account = Account.createFromPrivateKey(privateKey, networkType)
				console.debug('F:Result')
				console.debug(this.$store.state.account)
			},
			/**
       * Create a fresh basic JavaScript object account for use in wallet
       * @param {} networkIdentifier
       */
			generate_account (networkIdentifier) {
				console.debug('F:GA:Generate Account. identifier (' + networkIdentifier + ')')
				this.$store.state.account = Account.generateNewAccount(networkIdentifier)
				console.debug('GA:Result')
				console.debug(this.$store.state.account)
				return this.account
			},
			open_wallet (walletName, password, privateKey, networkIdentifierByte) {
				console.debug('F:OW:Open Wallet')
				console.debug(walletName)
				console.debug(password)
				console.debug(privateKey)
				console.debug(networkIdentifierByte)

				const passwordObject = new Password(password)
				this.$store.state.wallet = SimpleWallet.createFromPrivateKey(
					walletName,
					new Password(password),
					privateKey,
					networkIdentifierByte);

				console.debug('OW:Result')
				console.debug(this.$store.state.wallet)
			},
			hydrate (
				walletName,
				password,
				walletPrivateKey,
				networkIdentifier)
			{
				console.debug('F:H:Hydrate')
				const passwordObject = new Password(password)
				this.open_wallet(walletName, password, walletPrivateKey, networkIdentifier)
				this.$store.state.account = this.$store.state.wallet.open(passwordObject)
				this.isWalletPublic(this.$store.state.wallet.address.address)
				this.$store.state.publicAccount = PublicAccount.createFromPublicKey(this.$store.state.account.publicKey, this.$store.state.wallet.address.networkType)
				return true
			},
			/**
       * START CALL FUNCTIONS
       * TODO - Move these two individual
       */
			getBalance () {
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
			incomingTransactions () {
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
			outgoingTransactions () {
				var context = this
				this.$store.state.services.accountHttp.outgoingTransactions(
					this.$store.state.publicAccount
				)
					.subscribe(transactions => {
						context.$store.state.userTransactions.outgoing = transactions
					})
			},
			unconfirmedTransactions () {
				var context = this
				this.$store.state.services.accountHttp.unconfirmedTransactions(
					this.$store.state.publicAccount
				)
					.subscribe(transactions => {
						context.$store.state.userTransactions.unconfirmed = transactions
					})
			},
			/**
       * This function is just a facade for jobs that will run regularly. It is abstracted in to it's own
       * function because it is used independently and with interval
       */
			taskRunners () {
				console.debug('F:TR:Task Runners')
				this.getBalance()
				this.transactions()
				this.incomingTransactions()
				this.outgoingTransactions()
				this.unconfirmedTransactions()
			},
			/**
       * END CALL FUNCTIONS
       */
			startListeners () {
				console.debug('F:SL:Start Listeners: Interval time of ' + this.$store.state.intervalTime + 'ms')
				this.taskRunners()
				this.intervalReference = setInterval(this.taskRunners.bind(this), this.$store.state.intervalTime)
			},
			transactions (blockchainAddress = '') {
				console.log('F:T:Transactions')
				if (blockchainAddress) {
					var addressObject = Address.createFromRawAddress(blockchainAddress)
					console.log(addressObject)
					// this.services.accountHttp
					//   .getAccountInfo(addressObject)
					//   .subscribe(accountInfo => console.log(accountInfo), err => console.error(err));

					// accountHttp
					//     .transactions(publicAccount, new QueryParams(this.query.resultSize))
					//     .subscribe(transactions => console.log(transactions), err => console.error(err))
				} else {
					this.$store.state.services.accountHttp
						.transactions(this.$store.state.publicAccount, new QueryParams(this.$store.state.query.resultSize))
						.subscribe(transactions => {
							this.$store.state.userTransactions.historical = transactions
						}, err => {
							console.error(err)
						})
				}
			},
			transfer (payee) {
				console.debug('F:T:Transfer')
				const recipientAddress = Address.createFromRawAddress(payee.address)
				console.log(recipientAddress)

				console.log('preparing transaction')
				console.log(this.account)
				const transferTransaction = TransferTransaction.create(
					Deadline.create(23),
					recipientAddress,
					[XEM.createRelative(parseInt(payee.amount))],
					PlainMessage.create(payee.message),
					this.$store.state.wallet.network)

				const signedTransaction = this.$store.state.account.sign(transferTransaction)
				console.log(signedTransaction)
				this.$store.state.services.transactionHttp
					.announce(signedTransaction)
					.subscribe(x => console.log(x), err => console.error(err))
			},
			updateApiEndpoint (endpointAddress) {
				if (endpointAddress !== this.apiEndpoint) {

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
				this.$store.state.apiEndpoint = endpointAddress
			},
			isWalletPublic (address) {
				console.debug('F:ISW:Is Wallet Public: ' + address)

				var context = this
				var addressObject = Address.createFromRawAddress(address)
				var result = this.$store.state.services.accountHttp.getAccountInfo(addressObject)
					.subscribe((AccountInfo) => {
						context.$store.state.public = true
						console.debug('ISW: Found account on blockchain')
					},
					error => {
						console.log(error)
						context.$store.state.public = false
					}
					)
				console.log(result)
				return result
			},
			registerNamespace (namespaceDefinition) {
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
			isNamespaceAvailable (name) {
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
