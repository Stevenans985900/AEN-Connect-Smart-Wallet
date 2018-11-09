import Vue from 'vue'

export default class PluginStore {
	constructor (data = {}) {
		this.storeVM = new Vue({ data })
	}
	get state () {
		return this.storeVM.$data
	}
}
