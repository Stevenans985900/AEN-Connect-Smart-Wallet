export default function (context) {
	// Just a simple function to do any global actions on every router load
	context.store.commit('setLoading', {'t': 'router', 'v': true})
}
