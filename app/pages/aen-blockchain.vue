<template>
  <v-container>
    <v-layout row justify-center align-center>
      <!-- Contacts table -->
      <v-flex xs12>
        <v-toolbar class="primary mb-2">
          <v-toolbar-title>
            {{ $t('common.navigation.aen') }}
          </v-toolbar-title>
          <v-spacer />
          <!--<v-btn color="success" @click="dialogNewServiceSpace = true">-->
          <!--<v-icon>add</v-icon>New Service Space-->
          <!--</v-btn>-->
        </v-toolbar>
        <v-card>
          <v-card-text>
            {{ $t('common.message.coming_soon') }}
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog v-if="dialogNewServiceSpace" v-model="dialogNewServiceSpace" persistent max-width="1024px">
      <v-toolbar color="primary">
        <v-toolbar-title>{{ $t('aen.action.service_add') }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="dialogNewServiceSpace = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <v-form ref="newServiceSpaceForm" v-model="newServiceValid" @submit.prevent="onSubmit">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  v-model="name"
                  :rules="[rules.basic.required, rules.name.minLength]"
                  :error-messages="namespaceErrorMessages()"
                  :label="$t('aen.label.namespace')"
                  required
                  placeholder="e.g. AENC"
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="duration"
                  :rules="[rules.basic.required]"
                  :label="$t('aen.label.duration')"
                  required
                  placeholder="1000"
                />
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import Debounce from 'lodash.debounce'
  function initialDataState() {
    return {
      interval: null,
      dialogNewServiceSpace: false,
      namespaceErrorMessages: [],
      newServiceValid: false,
      duration: null,
      name: null,
      rules: {
        basic: {
          required: value => !!value || 'Required.'
        },
        name: {
          minLength: v => v.length >= 4 || 'Min 4 Characters'
        }
      }
    }
  }
  export default {
    /**
     * DATA
     * @returns {{dialog: boolean, headers: *[], search: string}}
     */
    data() { return initialDataState() },
    head() {
      return {
        title: 'AENConnect Smart Wallet - Address Book',
        meta: [
          { hid: 'description', name: 'description', content: 'The address book makes remembering all those addresses a breeze!' }
        ]
      }
    },
    /**
     * MOUNTED
     */
    mounted: function () {
      this.$log.debug('Dashboard Startup')
      // Only start once global loading finished
      if (process.client) {
        this.interval = setInterval(
          function () {
            if (this.$store.getters.booting === false) {
              clearInterval(this.interval)
              this.$store.commit('setLoading', {t: 'router', v: false})
            }
          }.bind(this),
          this.$store.state.time_definitions.controller_poll
        )
      }
    },
    beforeDestroy() {
      clearInterval(this.interval)
    },
    methods: {
      checkNamespaceAvailability: Debounce(function () {
        const networkHandler = this.$store.getters.networkHandler('aen')
        networkHandler.isNamespaceAvailable(this.name).then((isAvailable) => {
          if(isAvailable === false) { return 'Namespace Unavailable'}
        })
        return ''
      },1000)
    }
  }
</script>
