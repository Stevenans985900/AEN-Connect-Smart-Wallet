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
      <v-layout row wrap>
        <v-flex xs12 md3>
          <v-list>
            <template v-for="(faqCategory, categoryIndex) in help">
              <v-list-tile
                :key="categoryIndex"
                avatar
                @click="chooseCategory(categoryIndex)"
              >
                <v-list-tile-avatar>
                  <img src="/question.png">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ faqCategory.title }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-flex>

        <v-flex xs12 md9 v-if="categoryComponent">
          <component :is="categoryComponent"  />
        </v-flex>
        <v-flex xs12 md4 v-if="selectedCategory">
          <v-list>
            <template v-for="(faqEntry, faqIndex) in help[selectedCategory].faq">
              <v-list-tile
                :key="faqIndex"
                avatar
                @click="selectedEntry = faqIndex"
              >
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ faqEntry.title }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    sometimes there may need to be a subheading to the FAQ
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-flex>
        <v-flex xs12 md5>
          <component :is="component" v-if="component" />
          <template v-else>
            {{ youtubeVideo }}
            <youtube v-if="youtubeVideo" video-id="xwftD2aehpM" player-width="100%" />
            <p>
              {{ displayText }}
            </p>
          </template>
        </v-flex>

      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
  import FeedbackForm from '~/components/FeedbackForm'
  export default {
    components: { FeedbackForm },
    data() {
      return {
        categoryComponent: null,
        component: null,
        displayText: null,
        youtubeVideo: null,
        selectedCategory: null,
        selectedEntry: null,
        help: {
          'getting-started': {
            'title': 'Getting Started',
            'faq': [
              {
                'template': 'adding-first-wallet',
                'title': 'Adding your first wallet'
              },
              {
                'title': 'Adding more wallets',
                'youtubeVideo': 'xwftD2aehpM',
                'displayText': 'Here be the guide to adding multiple wallets'
              }
            ]
          },
          'dashboard': {
            'title': 'The Dashboard'
          },
          'wallet': {
            'title': 'Wallet Management'
          },
          'contacts': {
            'title': 'Address Book'
          },
          'security': {
            'title': 'Security'
          },
          'network': {
            'title': 'Connectivity'
          },
          'contact': {
            'title': 'Contact Us'
          },
          'about': {
            'title': 'About'
          }
        },
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
        this.selectedCategory = this.rawRouteName
      },
      selectedCategory: function () {
        this.component = null
        this.displayText = null
        this.youtubeVideo = null
      },
      selectedEntry: function() {
        // Reset the component view so that it won't show multiple entries by accident
        this.component = null
        this.displayText = null
        this.youtubeVideo = null

        // Check to see whether there is a template associated with this help entry
        let entry = this.help[this.selectedCategory].faq[this.selectedEntry]
        console.log(entry)
        if(entry.hasOwnProperty('template')) {
          this.component = () => import('./Help/' + entry.template)
        } else {
          this.displayText = entry.displayText
          if(entry.hasOwnProperty('youtubeVideo')) {
            this.youtubeVideo = entry.youtubeVideo
          }
        }
      }
    },
    methods: {
      chooseCategory(categoryIndex) {
        this.selectedCategory = null
        this.categoryComponent = null
        // If user clicked either the contact or about categories, special handling
        switch (categoryIndex) {
          case 'about':
            this.categoryComponent = () => import('./AboutUs')
            break
          case 'contact':
            this.categoryComponent = () => import('./ContactUs')
            break
          default:
            this.selectedCategory = categoryIndex
        }
      }
    }
  }
</script>
