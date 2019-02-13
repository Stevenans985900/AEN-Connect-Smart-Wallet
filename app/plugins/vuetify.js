import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  theme: {
    primary: '#00BCCA',
    accent:      colors.blue.accent2,
    secondary:   colors.grey.lighten1,
    info:        colors.blue.lighten1,
    warning:     colors.amber.darken2,
    error:       colors.red.accent4
  }
})