import Vue from 'vue'
import $g from '~/globals.json'
import axios from 'axios'

export const initialState = {
  contextWallet: {},
  lastUpdated: null,
  exchangeRates: {}
}

export const state = () => (initialState)

export const getters = {
  convertToUsd: (state) => (options) => {
    if(state.exchangeRates.hasOwnProperty(options.symbol)) {
      return (state.exchangeRates[options.symbol] * options.amount).toFixed(2)
    }
    return 0
  }
}

export const actions = {
  updateRates: () => {
    const baseURL = $g.binance.api_endpoint + $g.binance.price_to_use_route
    for (let currencySymbol in $g.binance.symbol) {
      axios.get(baseURL, {
        params: {
          symbol: $g.binance.symbol[currencySymbol],
        }
      })
        .then(function (response) {
          Vue.$log.debug('Exchange Store: Update Rates for ' + currencySymbol, response)
        })
        .catch(function (err) {
          Vue.$log.error('Error updating exchange rate', err)
        })
    }
  }
}