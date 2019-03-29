import Vue from 'vue'

export default class Genetic {
  constructor() {
    this.services = {}
    this.pluginName = 'Abstract'
  }
  balance(options) { Vue.$log.debug(this.pluginName+' plugin', options) }
  /**
   * Get details on an individual transaction
   * @param options
   */
  transactionDetails(options) { Vue.$log.debug(this.pluginName+' plugin', options)}
  transactionsHistorical(options) { Vue.$log.debug(this.pluginName+' plugin', options) }
  transactionsIncoming(options) { Vue.$log.debug(this.pluginName+' plugin', options)}
  transactionsOutgoing(options) { Vue.$log.debug(this.pluginName+' plugin', options)}
  transactionsUnconfirmed(options) { Vue.$log.debug(this.pluginName+' plugin', options) }
  /**
   * Send tokens / contract specifics from a wallet
   * @param options
   */
  transfer(options) { Vue.$log.debug(this.pluginName+' plugin', options) }
  getLiveWallet(options) { Vue.$log.debug(this.pluginName+' plugin', options) }
  walletLoad(options) { Vue.$log.debug(this.pluginName+' plugin', options) }
  walletNew(options) { Vue.$log.debug(this.pluginName+' plugin', options) }
}
