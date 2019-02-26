<script>

import { Doughnut } from 'vue-chartjs'

export default {
  extends: Doughnut,
  props: {
    data: {
      type: Object,
      default: function () { return {} }
    },
    plugins: {
      type: Array,
      default () {
        return [{
          beforeDraw: function(chart) {
            if (chart.config.options.elements.center) {
              //Get ctx from string
              var ctx = chart.chart.ctx;

              //Get options from the center object in options
              var centerConfig = chart.config.options.elements.center;
              var fontStyle = centerConfig.fontStyle || 'Roboto';
              var txt = centerConfig.text;
              var color = centerConfig.color || '#fff';
              var sidePadding = centerConfig.sidePadding || 20;
              var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
              //Start with a base font of 30px
              ctx.font = "30px " + fontStyle;

              //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
              var stringWidth = ctx.measureText(txt).width;
              var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

              // Find out how much the font can grow in width.
              var widthRatio = elementWidth / stringWidth;
              var newFontSize = Math.floor(30 * widthRatio);
              var elementHeight = (chart.innerRadius * 2);

              // Pick a new font size so it will not be larger than the height of label.
              var fontSizeToUse = Math.min(newFontSize, elementHeight);

              //Set font settings to draw it correctly.
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
              var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
              ctx.font = fontSizeToUse+"px " + fontStyle;
              ctx.fillStyle = color;

              //Draw text in center
              ctx.fillText(txt, centerX, centerY);
            }
          }
        }]
      }
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      colorPool: [
        {
          r: 17,
          g: 47,
          b: 65
        },
        {
          r: 8,
          g: 148,
          b: 161
        },
        {
          r: 71,
          g: 171,
          b: 108
        },
        {
          r: 242,
          g: 177,
          b: 52
        },
        {
          r: 237,
          g: 85,
          b: 59
        },
        {
          r: 41,
          g: 49,
          b: 62
        },
        {
          r: 47,
          g: 85,
          b: 103
        },
        {
          r: 255,
          g: 203,
          b: 63
        },
        {
          r: 251,
          g: 230,
          b: 192
        },
        {
          r: 208,
          g: 73,
          b: 49
        },
      ]
    }
  },
  watch: {
    chartData: function () {
      this.drawChart()
    }
  },
  mounted() { this.drawChart() },
  methods: {
    drawChart() {

      let colors = []
      let data = []
      let labels = []
      let count = 0
      
      for (let key in this.data) {
        data.push(this.data[key])
        labels.push(key)
        colors.push('rgb('+this.colorPool[count].r+', '+this.colorPool[count].g+', '+this.colorPool[count].b+')')
        count++
      }

      this.renderChart({
        datasets: [{
          "backgroundColor": colors,
          "data": data
        }],
        labels: labels
      }, {
        legend: {
          display: false
        },
        elements: {
          center: {
            text: this.title
          }
        },
        responsive: true,
        maintainAspectRatio: false
      })
    }
  }
}
</script>
