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
              backgroundColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(54, 162, 235)",
                "rgb(255, 205, 86)"
              ],
              data: [10, 20, 30, 40]
            }
          ],
          labels: ["AENC", "AENC", "BTC", "ETH"]
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
  mounted() {
    this.renderChart(this.chartdata, this.options);
  }
};
</script>

<style>
</style>