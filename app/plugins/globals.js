import Vue from 'vue'
import globals from '~/globals.json'
import _get from 'lodash.get'

Vue.prototype.$g = (key) => {
	let val = _get(globals, key, '')
	if (!val) console.warn(key, ' is empty in $g')
	return val || key
}
