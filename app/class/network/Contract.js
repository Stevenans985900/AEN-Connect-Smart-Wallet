import Vue from 'vue'
import Generic from '~/class/network/Generic'
import axios from 'axios'
import Web3 from 'web3'
import EthereumTx from "ethereumjs-tx";
// import EthereumTx from 'ethereumjs-tx'
// function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

export default class Contract extends Generic {
  constructor(apiEndpoint, config) {
    super()
    this.pluginName = 'contract'
    this.config = config
    this.web3 = new Web3(apiEndpoint)
  }

  balance(options) {
    super.balance(options)
    return new Promise((resolve, reject) => {
      import('~/class/network/contract/erc20').then((erc20Interface) => {
        const contract = new this.web3.eth.Contract(erc20Interface.abi, options.address)
        contract.methods.balanceOf(options.managerWalletAddress).call().then((response) => {
          // Work out where the decimal place should be
          const balance = response.toString()
          const balanceBreakpoint = balance.length - options.decimals
          const finalBalance = Number(balance.slice(0, balanceBreakpoint) + '.' + balance.slice(balanceBreakpoint)).toFixed(2)
          resolve(finalBalance)
        })
          .catch((err) => {
            reject(err)
          })
      })
    })
  }

  async contractInformation(options) {
    Vue.$log.debug('Contract Method', options)
    let contract = {}
    return new Promise(async (resolve, reject) => {
      import('~/class/network/contract/' + options.contractAddress).then((erc20Interface) => {
        contract.contractName = erc20Interface.name
        contract.decimals = erc20Interface.decimals
        contract.symbol = erc20Interface.symbol
        resolve(contract)
      })
      // If app is not aware of the contract specification, try and get details from the wire. this is quite likely
      .catch(async () => {
        try {
          contract.contractName = await this.erc20PublicMethod({
            contractAddress: options.contractAddress,
            method: 'name'
          })
          contract.decimals = await this.erc20PublicMethod({
            contractAddress: options.contractAddress,
            method: 'decimals'
          })
          contract.symbol = await this.erc20PublicMethod({
            contractAddress: options.contractAddress,
            method: 'symbol'
          })
          resolve(contract)
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  erc20PublicMethod(options) {
    Vue.$log.debug('Contract Plugin: ERC20 Method', options)
    return new Promise((resolve, reject) => {
      import('~/class/network/contract/erc20').then((erc20Interface) => {
        const contract = new this.web3.eth.Contract(erc20Interface.abi, options.contractAddress)
        contract.methods[options.method]().call()
        .then((response) => {
          Vue.$log.debug('Contract Store: ERC20 Method Result ' + options.method + ' = ' + response)
          resolve(response)
        })
        .catch ((err) => {
          Vue.$log.debug('ERC20 Method failed because', err)
          reject(err)
        })
      })
    })
  }
  transactionsHistorical(options) {
    super.transactionsHistorical(options)
    const apiEndpoint = this.config.etherscan.api_endpoint.replace('###NETWORK_IDENTIFIER###', options.network.identifier)
    return new Promise((resolve, reject) => {
      axios.get(apiEndpoint, {
        params: {
          module: 'account',
          action: 'txlist',
          address: options.address,
          startblock: 0,
          endblock: 99999999,
          sort: 'desc',
          apikey: this.config.etherscan.api_key
        }
      })
        .then(function (response) {
          // Filter the results by the contract address
          response = response.data.result
          let transactions = []
          for(let transactionKey in response) {
            let transaction = response[transactionKey]
            if(transaction.contractAddress === options.wallet.address) {
              transactions.push(transaction)
            }
          }
          resolve(transactions)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }

  transfer(options) {
    super.transfer(options)
    return new Promise(async (resolve) => {
      const privateKey = Buffer.from(options.transfer.credentials.privateKey.substring(2), 'hex')
      const erc20Interface = await import('~/class/network/contract/erc20')
      const contract = new this.web3.eth.Contract(erc20Interface.abi, options.source.address)
      const nonce = await this.web3.eth.getTransactionCount(options.transfer.managerWallet.address, 'pending')
      const data = contract.methods.transfer(options.destination.address, options.destination.amount).encodeABI()

      const txParams = {
        nonce: this.web3.utils.toHex(nonce),
        gasPrice: this.web3.utils.toHex(options.transfer.gasPrice),
        gas: this.web3.utils.toHex(options.transfer.gas),
        gasLimit: this.web3.utils.toHex(options.transfer.gasLimit),
        to: options.source.address,
        data: data,
        chainId: 3
      }
      const tx = new EthereumTx(txParams)
      tx.sign(privateKey)
      const serializedTx = tx.serialize()
      // const meth =
      this.web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'))
        .on('transactionHash', function(transactionHash) {
          resolve(transactionHash)
        })
        .on('error', function(err){ Vue.$log.error(err) })
    })
  }

  /**
   * For Ethereum, check the balance of the account to determine whether or not it is live
   * @param options
   */
  getLiveWallet(options) {
    super.getLiveWallet(options)
    return new Promise((resolve) => {
      this.balance(options).then((balance) => {
        if (balance.toString() !== '0') {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
  }
  /**
     * Adoption of ERC20 contracts doesn't involve any initial processing so,
     * just use the opportunity to return properties from the original options
     * object
     * @param options
     * @returns {Promise<any>}
     */
  walletLoad(options) {
    super.walletLoad(options)

    return new Promise((resolve) => {
      resolve({
        name: options.name,
        address: options.address.toLowerCase(),
        onChain: true,
        managerWalletAddress: options.managerWalletAddress,
        symbol: options.symbol,
        decimals: options.decimals
      })
    })
  }

  getWeb3() {
    return this.web3
  }
  setProvider(endpoint) { this.web3.setProvider(endpoint) }
  web3() { return this.web3 }
}
