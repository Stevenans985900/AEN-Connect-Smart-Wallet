export default class Genetic {
  constructor() {
    this.services = {}
    this.pluginName = 'Abstract'
  }
  balance(options) {
    console.debug(this.pluginName + ' Plugin: Balance')
    console.debug(options)
  }
  /**
   * Get details on an individual transaction
   * @param options
   */
  transactionDetails(options) {
    console.debug(this.pluginName + ' Plugin: Transaction Details')
    console.debug(options)
  }
  transactionsHistorical(options) {
    console.debug(this.pluginName + ' Plugin: Transactions Historical')
    console.debug(options)
  }
  transactionsIncoming(options) {
    console.debug(this.pluginName + ' Plugin: Transactions Incoming')
    console.debug(options)
  }
  transactionsOutgoing(options) {
    console.debug(this.pluginName + ' Plugin: Transactions Outgoing')
    console.debug(options)
  }
  transactionsUnconfirmed(options) {
    console.debug(this.pluginName + ' Plugin: Transactions Unconfirmed')
    console.debug(options)
  }
  /**
   * Send tokens / contract specifics from a wallet
   * @param options
   */
  transfer(options) {
    console.debug(this.pluginName + ' Plugin: Transfer')
    console.debug(options)
  }
  getLiveWallet(options) {
    console.debug(this.pluginName + ' Plugin: Wallet is Live?')
    console.debug(options)
  }
  walletLoad(options) {
    console.debug(this.pluginName + ' Plugin: Wallet Load')
    console.debug(options)
  }
  walletNew(options) {
    console.debug(this.pluginName + ' Plugin: Wallet New')
    console.debug(options)
  }
}
