import { Account, AccountHttp, Address, BlockchainHttp, Deadline, MosaicAmountView, MosaicHttp, NamespaceHttp, MosaicService, NetworkType, Password, PlainMessage, PublicAccount, QueryParams, SimpleWallet, TransferTransaction, TransactionHttp, XEM } from 'chain-js-sdk'
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
			/**
       * Create a fresh basic JavaScript object account for use in wallet
       * @param {} networkIdentifier
       */
			generate_account (networkIdentifier) {
				console.debug('F:GA:Generate Account. identifier (' + networkIdentifier + ')')
				this.account = Account.generateNewAccount(networkIdentifier)
				console.debug('GA:Result')
				console.debug(this.account)
				return this.account
			},
			generate_wallet (account, password, networkIdentifierByte, walletName) {
				console.debug('F:GW: Generate Wallet')
				console.debug(account, password, networkIdentifierByte, walletName)
				this.wallet = SimpleWallet.createFromPrivateKey(
					walletName,
					new Password(password),
					account.privateKey,
					networkIdentifierByte
				)
				console.debug('GW:Result')
				console.debug(this.wallet)
				return this.wallet
			},
			hydrate (
				walletName,
				password,
				walletPrivateKey,
				networkIdentifier,
				networkIdentifierByte,
				accountPrivateKey
			) {
				console.debug('F:H:Hydrate')
				const passwordObject = new Password(password)

				this.$store.state.wallet = SimpleWallet.createFromPrivateKey(
					walletName,
					passwordObject,
					accountPrivateKey,
					networkIdentifierByte)
				this.$store.state.account = this.$store.state.wallet.open(passwordObject)
				console.debug('H:Result')
				console.debug(this.$store.state.account)
				this.isWalletPublic(this.$store.state.wallet.address.address)
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
					.mosaicsAmountViewFromAddress(this.$store.state.wallet.address.address)
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
				this.$store.state.services.accountHttp.incomingTransactions(this.$store.state.accountInfo)
					.subscribe(transactions => {
						console.debug('IT:R')
						console.debug(transactions)
						context.$store.state.userTransactions.incoming = transactions
					})
			},
			outgoingTransactions () {
				var context = this
				this.$store.state.services.accountHttp.outgoingTransactions(this.$store.state.accountInfo)
					.subscribe(transactions => {
						console.log('outgoing')
						console.log(transactions)
						context.$store.state.userTransactions.outgoing = transactions
					})
			},
			/**
       * This function is just a facade for jobs that will run regularly. It is abstracted in to it's own
       * function because it is used independently and with interval
       */
			taskRunners () {
				console.debug('F:TR:Task Runners')
				this.getBalance()
				// this.incomingTransactions()
				// this.outgoingTransactions()
			},
			/**
       * END CALL FUNCTIONS
       */
			startListeners () {
				console.debug('F:SL:Start Listeners: Interval time of ' + this.$store.state.intervalTime + 'ms')
				this.intervalReference = setInterval(this.taskRunners.bind(this), this.$store.state.intervalTime)
			},
			transactions (blockchainAddress = '') {
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
					console.log(this)
					console.log(this.$store.state.account.publicKey)
					const publicAccount = PublicAccount.createFromPublicKey(this.$store.state.account.publicKey, this.$store.state.wallet.address.networkType)

					this.$store.state.services.accountHttp
						.transactions(publicAccount, new QueryParams(this.$store.state.query.resultSize))
						.subscribe(transactions => {
							console.log(transactions)
							this.$store.state.userTransactions.historical = transactions
						}, err => {
							console.error(err)
						})
				}
			},
			transfer (payee) {
				console.log(payee)
				const recipientAddress = Address.createFromRawAddress(payee.address)
				console.log(recipientAddress)

				console.log('preparing transaction')
				console.log(this.account)
				const transferTransaction = TransferTransaction.create(
					Deadline.create(23),
					recipientAddress,
					[XEM.createRelative(10)],
					PlainMessage.create('Welcome To AEN'),
					this.wallet.network)

				const signedTransaction = this.$store.state.account.sign(transferTransaction)
				console.log(signedTransaction)
				this.services.transactionHttp
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

				this.$store.state.services.accountHttp.getAccountInfo(addressObject)
					.subscribe((AccountInfo) => {
						context.$store.state.accountInfo = AccountInfo
						console.debug('ISW: Found account on blockchain')
						return true
					},
					error => {
						console.log(error)
						return false
					}
					)
			}
		}
	}
}
