import Vue from 'vue'

export default class Genetic {
  constructor() {
    this.services = {}
    this.pluginName = 'Abstract'
  }
  balance(options) { Vue.$log.debug(this.pluginName+' plugin: Balance', options) }
  /**
   * Get details on an individual transaction
   * @param options
   */
  transactionDetails(options) { Vue.$log.debug(this.pluginName+' plugin: Transaction Details', options)}
  transactionsHistorical(options) { Vue.$log.debug(this.pluginName+' plugin: Transaction Historical', options) }
  transactionsIncoming(options) { Vue.$log.debug(this.pluginName+' plugin: Transaction Incoming', options)}
  transactionsOutgoing(options) { Vue.$log.debug(this.pluginName+' plugin: Transaction Outgoing', options)}
  transactionsUnconfirmed(options) { Vue.$log.debug(this.pluginName+' plugin: Transaction Unconfirmed', options) }
  /**
   * Send tokens / contract specifics from a wallet
   * @param options
   */
  transfer(options) { Vue.$log.debug(this.pluginName+' plugin: Transfer', options) }
  getLiveWallet(options) { Vue.$log.debug(this.pluginName+' plugin: Get Live Wallet', options) }
  walletLoad(options) { Vue.$log.debug(this.pluginName+' plugin: Wallet Load', options) }
  walletNew(options) { Vue.$log.debug(this.pluginName+' plugin: Wallet New', options) }
}
