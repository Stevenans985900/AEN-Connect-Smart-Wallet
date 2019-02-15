<template>
  <v-dialog
    v-model="dialogShow"
    fullscreen
  >
    <v-btn
      slot="activator"
      small round outline icon
    >
      <v-icon>
        help
      </v-icon>
    </v-btn>

    <v-toolbar>
      <v-img src="/logo.png" contain height="25" max-width="125px" />
      <v-toolbar-title>Help</v-toolbar-title>
      <v-spacer />

      <v-btn small round outline @click="dialogShow = false">
        Click again to return to what you were doing &nbsp;&nbsp;<v-icon>help</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card>
      <v-card-text>
        <component :is="component" v-if="component" />
        <v-layout row wrap>
          <v-flex xs12 md6>
            <v-card>
              <v-card-title>
                <h2>
                  General Help
                </h2>
              </v-card-title>
              <v-card-text>
                <p>
                  Some app wide help and guidance
                </p>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 md5 offset-md1>
            <v-card>
              <v-card-title>
                <h2>
                  Get in contact
                </h2>
              </v-card-title>
              <v-card-text>
                <feedback-form />
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import FeedbackForm from '~/components/FeedbackForm'
  export default {
    components: { FeedbackForm },
    data() {
      return {
        component: null,
        routeName: ''
      }
    },
    computed: {
      dialogShow: {
        get: function () { return this.$store.state.user.help },
        set: function (val) { this.$store.commit('setUserProperty', {key: 'help', value: val}) }
      },
      rawRouteName() { return this.$route.name }
    },
    watch: {
      rawRouteName: function () {
        this.updateComponent()
      }
    },
    mounted: function () {
      this.updateComponent()
    },
    methods: {
      updateComponent() {
        this.routeName = this.rawRouteName[0].toUpperCase() + this.rawRouteName.slice(1)
        try {
          this.component = () => import('./Help/' + this.routeName)
        } catch (err) {
          console.debug(err)
        }
      }
    }
  }
</script>
