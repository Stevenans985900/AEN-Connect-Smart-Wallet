import Vue from 'vue'
import VueLogger from 'vuejs-logger'

const isProduction = process.env.NODE_ENV === 'production'
const enabled = Vue.prototype.$g('internal.loggerEnabled')
const options = {
    isEnabled: enabled,
    logLevel : isProduction ? 'error' : 'debug',
    stringifyArguments : false,
    showLogLevel : true,
    showMethodName : true,
    separator: '|',
    showConsoleColors: true
};

Vue.use(VueLogger, options)
