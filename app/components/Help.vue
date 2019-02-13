<template>
  <v-dialog
    v-model="dialogShow"
    width="500"
  >
    <v-btn
      slot="activator"
      fab small flat
    >
      <v-icon>
        help
      </v-icon>
    </v-btn>

    <v-toolbar>
      <v-toolbar-title>Help</v-toolbar-title>
    </v-toolbar>
    <v-card>
      <v-card-text>
        <component :is="component" v-if="component" />
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
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