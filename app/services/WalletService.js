import PluginStore from '~/services/PluginStore'
import EthereumPlugin from '~/services/network/Ethereum'
import AenPlugin from '~/services/network/Aen'

export default {
  Store: PluginStore,
  Ethereum: EthereumPlugin,
  Aen: AenPlugin,
  install: (Vue, options) => {
    Vue.mixin({
      beforeCreate() {
        this.$walletService.$store = options.store
        this.$walletService.Aen = new AenPlugin()
        this.$walletService.Eth = new EthereumPlugin(this.$g('eth.api_endpoint'))
      }
    })
    Vue.prototype.$walletService = {
      $store: {},
      /**
       *
       * @param network
       * @param options
       * @returns {wallet|{createBrain, importPrivateKey, createPRNG}|*|{}}
       */
      walletLoad(network, options) {
        console.debug('Wallet Service:Load '+network)

        let wallet = {}
        switch (network) {
          case 'aen':
            // Do behind the scenes work
            this.$store.state.account = this.Aen.accountLoad(options)

            options.accountPrivateKey = this.$store.state.account.privateKey
            this.$store.state.wallet = this.Aen.walletLoad(options)

            // Package wallet up in to simple format for later reference
            wallet.type = 'aen'
            wallet.name = options.name
            wallet.password = options.password
            wallet.accountPrivateKey = this.$store.state.account.privateKey
            wallet.privateKey = this.$store.state.wallet.encryptedPrivateKey.encryptedKey
            wallet.address = this.$store.state.wallet.address.address
            wallet.network = options.network
            return wallet
          case 'eth':
            break;
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

        let wallet = {}
        switch (network) {
          case 'aen':
            // Do behind the scenes work
            this.$store.state.account = this.Aen.accountNew(options)
            options.accountPrivateKey = this.$store.state.account.privateKey
            this.$store.state.wallet = this.Aen.walletNew(options)

            // Package wallet up in to simple format for later reference
            wallet.type = 'aen'
            wallet.name = options.name
            wallet.password = options.password
            wallet.accountPrivateKey = this.$store.state.account.privateKey
            wallet.privateKey = this.$store.state.wallet.encryptedPrivateKey.encryptedKey
            wallet.address = this.$store.state.wallet.address.address
            wallet.network = options.network
            return wallet

          case 'eth':

            var ethWallet = this.Eth.walletNew(options)
            // Package wallet up in to simple format for later reference
            wallet.type = 'eth'
            wallet.name = options.name
            wallet.address = ethWallet.address
            wallet.privateKey = ethWallet.privateKey
            return wallet
        }

      },
      /**
       * Check if the address can be found on the live blockchain
       */
      walletIsLive(network, options) {
        console.debug('Wallet Service: Is Wallet Live on ' + network)
        switch (network) {
          case 'aen':
            return this.Aen.walletIsLive(options)
          case 'eth':
            break;
        }
        //
        // var context = this
        //
        // return result
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
      }
    }
  }
}