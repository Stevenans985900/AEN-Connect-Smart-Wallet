<template>
  <v-layout row>
    <v-flex xs12>
      <p>
        Smart Connect currently supports AEN, Bitcoin, Ethereum, and Ethereum Smart Contracts. It supports multiple networks
        for each protocol, not limited to working on just the MainNet or TestNet but support for multiple networks is
        dependant on the deployment configuration of this wallet.
      </p>
      <p>
        For this build of Smart Connect, the following networks are supported:
      </p>
      <h3>AEN Networks</h3>
      <ul>
        <li v-for="(network) in aenNetworks" :key="network.name">
          <span v-if="network.testing">
            <v-chip>Testing</v-chip>
          </span>
          {{ network.name }}
        </li>
      </ul>
      <h3>Bitcoin Networks</h3>
      <ul>
        <li v-for="(network) in btcNetworks" :key="network.name">
          <span v-if="network.testing">
            <v-chip>Testing</v-chip>
          </span>
          {{ network.name }}
        </li>
      </ul>
      <h3>Ethereum Networks</h3>
      <ul>
        <li v-for="(network) in ethNetworks" :key="network.name">
          <span v-if="network.testing">
            <v-chip>Testing</v-chip>
          </span>
          {{ network.name }}
        </li>
      </ul>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    computed: {
      aenNetworks() { return this.$g('aen.available_networks') },
      btcNetworks() { return this.$g('btc.available_networks') },
      ethNetworks() { return this.$g('eth.available_networks') }
    }
  }
</script>