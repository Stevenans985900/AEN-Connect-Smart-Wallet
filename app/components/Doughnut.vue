<script>
import { Doughnut } from "vue-chartjs";

export default {
  extends: Doughnut,
  props: {
    chartdata: {
      type: Object,
      default: function() {
        return {
          datasets: [
            {
              backgroundColor: [],
              data: []
            }
          ],
          labels: []
        };
      }
    },
    options: {
      type: Object,
      default: function() {
        return {
          responsive: true,
          maintainAspectRatio: false
        };
      }
    }
  },
  watch: {
    chartdata: function() {
      this.renderChart(this.chartdata, this.options);
    }
  },
  //       console.log("Triggered process wallets watcher");
  //       console.log(value);
  //       console.log(this.walletCount);
  //       if (value === this.walletCount) {
  //         this.loading = false;
  //         this.renderChart(this.chartdata, this.options);
  //       } else {
  //         this.loading = true;
  //       }
  //     }
  //   },
  mounted() {
    this.renderChart(this.chartdata, this.options);
  }
};
</script>