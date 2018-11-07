<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>

      <!-- Initial setup -->
      <v-card>
        <v-card-title class="headline">Register a new namespace</v-card-title>
        <v-card-text>
          <!-- Setup wallet from existing account -->
          <v-card>
            <v-card-text>
              <p>
                This page will allow for management of namespaces, however we choose to implement them
              </p>
              <v-alert
                value="That namespace is already in use"
                type="warning"
                v-if="existingNamespace"
              >That namespace is already in use</v-alert>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-text-field
                    label="Namespace Identifier"
                    v-model="namespace.name"
                    :rules="[nameRules.required, nameRules.min]"
                    required
                    placeholder="e.g. AENC"
                  ></v-text-field>
                  <v-text-field
                    label="Duration"
                    v-model="namespace.duration"
                    :rules="[durationRules.required]"
                    required
                    placeholder="1000"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-btn v-if="valid" @click="save">Submit</v-btn>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
var debounce = require('lodash.debounce')
export default {
	data () {
		return {
			debounceName: {},
			// Used to determine the outcome action after clicking the save button
			namespace: {
				name: '',
				duration: 1000
			},
			nameRules: {
				required: value => !!value || 'Required.',
				min: v => v.length >= 3 || 'Min 3 Characters'
			},
			durationRules: {
				required: value => !!value || 'Required.'
			},
			outcome: false,
			dialog: false
		}
	},
	computed: {
		computedForm: function () {
			return Object.assign({}, this.namespace)
		},
		existingNamespace: function () { return this.$account.$store.state.contextNamespace },
		valid: function () {
			if (this.namespace.name !== '' && this.existingNamespace === false) {
				return true
			}
		}
	},
	created: function () {
		// Only start once global loading finished
		var preperationInterval = setInterval(function () {
			if (this.$store.getters.booting === false) {
				clearInterval(preperationInterval)

				this.debounceName = debounce(this.checkAvailability, 500)

				this.$store.commit('setLoading', { 't': 'router', 'v': false })
			}
		}.bind(this), 2000)
	},
	watch: {
		computedForm: {
			handler: function (n, o) {
				if (n.name !== o.name && n.name.length >= 3) {
					this.debounceName(n.name)
				}
			},
			deep: true
		}
	},
	methods: {
		checkAvailability (name) {
			console.debug('F:CA:Check Availability with name = ' + name)
			this.$account.isNamespaceAvailable(name)
		},
		save () {
			this.$account.registerNamespace(this.namespace)
			var message = 'Namespace registration in progress'
			this.$store.commit('showNotification', { 'type': 'success', 'message': message })
			this.$nuxt.$router.replace({ path: '/ledger' })
		}
	}
}
</script>
