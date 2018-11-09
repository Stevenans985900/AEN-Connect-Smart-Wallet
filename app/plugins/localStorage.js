import createPersistedState from 'vuex-persistedstate'

export default ({store}) => {
	createPersistedState({
		// Salt key to use
		key: 'aenchain',
		// If saved objects reference self, add support for magic methods
		supportCircular: true
	})(store)
}
