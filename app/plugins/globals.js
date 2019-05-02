import Vue from 'vue'
import globals from '~/globals.json'
import _get from 'lodash.get'

Vue.prototype.$g = (key) => {
  const val = _get(globals, key, false)
  return val
}
