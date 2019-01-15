<template>
  <v-layout row justify-center align-center>
    <v-flex xs12 md6>
      <v-progress-circular v-if="loading === true" indeterminate/>
      <v-card v-else>
        <v-card-text v-if="haveLiveWallet == true">
          <v-list>
            <template v-for="(wallet, address) in wallets">
              <v-list-tile v-if="wallet.onChain == true" :key="address">
                <v-list-tile-content>
                  <v-list-tile-title v-html="wallet.balance"/>
                  <v-list-tile-sub-title v-html="wallet.name"/>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card-text>
        <v-card-text v-else>
          <p>You do not currently have any wallets with tokens present.</p>
          <p v-if="contextWallet.network.name === 'TestNet'">
            You are on TestNet so, it is possible to use a faucet to receive some free tokens. Please click <a :href="faucet.address + '?address=' + contextWallet.address" target="_blank">here</a> to retrieve
          </p>
          <p>Please send some tokens to your wallet using the address shown below</p>
          <business-card :wallet="contextWallet" />
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs12 md6>
      <v-progress-circular v-if="loading === true" indeterminate/>
      <doughnut v-else :chartdata="chartdata"/>
    </v-flex>
  </v-layout>
</template>

<script>
import BusinessCard from "~/components/BusinessCard";
import Doughnut from "~/components/Doughnut";

export default {
  components: {
    BusinessCard,
    Doughnut
  },
  data() {
    return {
      colorSchema: {
        aen: "rgb(255, 99, 132)",
        eth: "rgb(54, 162, 235)",
        btc: "rgb(54, 162, 235)"
      },
      haveLiveWallet: false,
      processedWallets: 0,
      walletCount: 0,
      loading: true,
      chartdata: {
        datasets: [
          {
            backgroundColor: [],
            data: []
          }
        ],
        labels: []
      }
    };
  },
  computed: {
    contextWallet() {
      return this.$store.state.wallet.context
    },
    faucet() {
      return this.$g('aen.faucets')[0]
    },
    wallets() {
      return this.$store.state.wallet.wallets;
    }
  },
  watch: {
    processedWallets: function(value) {
      if (value === this.walletCount) {
        this.loading = false;
      } else {
        this.loading = true;
      }
    }
  },
  mounted() {
    let color, wallet;
    
    let vm = this;
    this.walletCount = Object.keys(this.wallets).length;
    for (wallet in this.wallets) {
      if (this.wallets[wallet].onChain === true) {
        this.haveLiveWallet = true
        this.$store
          .dispatch("wallet/balance", this.wallets[wallet])
          .then(walletProcessed => {
            switch (walletProcessed.type) {
              case "aen":
                color = this.colorSchema.aen;
                break;
              case "eth":
                color = this.colorSchema.eth;
                break;
              case "btc":
                color = this.colorSchema.btc;
                break;
            }

            if (walletProcessed.hasOwnProperty("balance")) {
              vm.chartdata.datasets[0].backgroundColor.push(color);
              vm.chartdata.datasets[0].data.push(walletProcessed.balance);
              vm.chartdata.labels.push(walletProcessed.name);
            }
            vm.processedWallets++;
          })
          .catch(err => {
            console.log('catching "error"');
            console.error(err);
            return err;
          });
      } else {
        this.processedWallets++;
      }
    }
  }
};
</script>

<style>
</style>