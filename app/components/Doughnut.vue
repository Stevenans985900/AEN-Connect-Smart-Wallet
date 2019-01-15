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
  mounted() {
    this.renderChart(this.chartdata, this.options);
  }
};
</script>