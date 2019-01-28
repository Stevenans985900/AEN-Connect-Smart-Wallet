import PluginStore from './PluginStore'
import EthereumPlugin from './network/Ethereum'
import AenPlugin from './network/Aen'

export default {
  store: PluginStore,
  Ethereum: EthereumPlugin,
  Aen: AenPlugin,
  install: (Vue, options) => {
    Vue.mixin({
      beforeCreate() {
        this.$walletService.$store = options.store
        this.$walletService.Aen = new AenPlugin()
        this.$walletService.Eth = new EthereumPlugin()
      }
    })
    Vue.prototype.$walletService = {
      transactionsHistorical(network, options) {
        console.debug('Wallet Service: Transactions Historical on '+network)
        switch (network) {
          case 'aen':
          default:
            return this.Aen.transactionsHistorical(options)
        }
      },
      /**
       *
       * @param network
       * @param options
       * @returns {wallet|{createBrain, importPrivateKey, createPRNG}|*|{}}
       */
      walletNew(network, options) {
        console.debug('Wallet Service: New '+network)

        let wallet = {
          active: false,
          name: options.name
        }
        switch (network) {
          case 'aen':
            // Do behind the scenes work
            this.$store.state.account = this.Aen.accountNew(options)
            options.accountPrivateKey = this.$store.state.account.privateKey
            this.$store.state.wallet = this.Aen.walletNew(options)

            // Package wallet up in to simple format for later reference
            wallet.type = 'aen'
            wallet.password = options.password
            wallet.accountPrivateKey = this.$store.state.account.privateKey
            wallet.privateKey = this.$store.state.wallet.encryptedPrivateKey.encryptedKey
            wallet.publicKey = this.$store.state.account.publicKey
            wallet.address = this.$store.state.wallet.address.address
            wallet.network = options.network
            return wallet

          case 'eth':

            var ethWallet = this.Eth.walletNew(options)
            // Package wallet up in to simple format for later reference
            wallet.type = 'eth'
            wallet.address = ethWallet.address
            wallet.privateKey = ethWallet.privateKey
            return wallet
        }

      },
      /**
       *
       */
      getBalance(network, options) {
        console.debug('F:GB:Get Balance')
        switch (network) {
          case 'aen':
            this.$store.state.meta.balance = this.Aen.balance(options)
            return this.$store.state.meta.balance;
          case 'eth':
            break;
        }
      },
      /**
       *
       * @param {*} transferInformation
       */
      transfer(network, options) {
        console.debug('F:GB:Get Balance')
        switch (network) {
          case 'aen':
            this.Aen.transfer(options)
            return this.$store.state.meta.balance;
          case 'eth':
            break;
        }
      },
      /**
       *
       * @param network
       * @param options
       */
      updateApiEndpoint(network, options) {
        console.debug('Wallet Service: Update API endpoint')
        switch (network) {
          case 'aen':
            this.Aen.updateApiEndpoint(options)
            break
          case 'eth':
            break;
        }
      }
    }
  }
}