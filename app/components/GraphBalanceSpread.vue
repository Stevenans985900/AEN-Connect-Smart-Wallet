<template>
  <v-layout row justify-center align-center>
    <v-flex xs12 md6>
      <v-progress-circular v-if="loading === true" indeterminate/>
      <doughnut v-else :chartdata="chartdata"/>
    </v-flex>
    <v-flex xs12 md6>
      <v-progress-circular v-if="loading === true" indeterminate/>
      <v-card v-else>
        <v-list>
          <template v-for="(wallet, address) in wallets">
            <v-list-tile :key="address">
              <v-list-tile-content>
                <v-list-tile-title v-html="wallet.balance"/>
                <v-list-tile-sub-title v-html="wallet.name"/>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Doughnut from "~/components/Doughnut";

export default {
  components: {
    Doughnut
  },
  data() {
    return {
      colorSchema: {
        aen: "rgb(255, 99, 132)",
        eth: "rgb(54, 162, 235)",
        btc: "rgb(54, 162, 235)"
      },
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
    wallets() {
      return this.$store.state.wallet.wallets;
    }
  },
  watch: {
    processedWallets: function(value) {
      console.log("Triggered process wallets watcher");
      console.log(value);
      console.log(this.walletCount);
      if (value === this.walletCount) {
        this.loading = false;
      } else {
        this.loading = true;
      }
    }
  },
  mounted() {
    let color, wallet;
    console.log("mounted");

    let vm = this;
    this.walletCount = Object.keys(this.wallets).length;
    console.log("dealig with so many wallets: " + this.walletCount);
    for (wallet in this.wallets) {
      if (this.wallets[wallet].onChain === true) {
        console.log("processing the following wallet");
        console.log(this.wallets[wallet]);
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