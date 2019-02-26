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
      <v-toolbar-title>{{ $t('common.label.help') }}</v-toolbar-title>
      <v-spacer />

      <v-btn small round outline @click="dialogShow = false">
        {{ $t('help.message.click_to_return') }}&nbsp;&nbsp;<v-icon>help</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card>
      <v-layout row wrap>
        <!-- Category Selection -->
        <v-flex xs12 md3>
          <v-list>
            <template v-for="(faqCategory, categoryIndex) in help">
              <v-list-tile
                :key="categoryIndex"
                avatar
                @click="chooseCategory(categoryIndex)"
                :color="isActiveCategory(categoryIndex)"
              >
                <v-list-tile-avatar v-if="faqCategory.icon">
                  <v-icon>
                    {{ faqCategory.icon }}
                  </v-icon>
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
        <!-- If one of the categories themselves spin off in to a different component -->
        <v-flex v-if="categoryComponent" xs12 md9>
          <component :is="categoryComponent" />
        </v-flex>

        <!-- Entry Selection -->
        <v-flex v-if="help[selectedCategory]" xs12 md3>
          <v-list>
            <template v-for="(faqEntry, faqIndex) in help[selectedCategory].faq">
              <v-list-tile
                :key="faqIndex"
                avatar
                @click="selectedEntry = faqIndex"
                :color="isActiveEntry(faqIndex)"
              >
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ faqEntry.title }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title v-if="faqEntry.subtitle">
                    {{ faqEntry.subtitle }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-flex>

        <!-- Entry Display -->
        <v-flex xs12 md6 class="ma-2">
          <component :is="component" v-if="component !== null" />
          <template v-else>
            <youtube v-if="youtubeVideo" :video-id="youtubeVideo" player-width="100%" />
            <span v-html="displayText" />
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
            'title': 'Introduction',
            'icon': 'flash_on',
            'faq': [
              {
                'title': 'What is Smart Connect Wallet?',
                'subtitle': 'Why use the AEN Connect Smart Wallet',
                'displayText': '<p>The Smart Wallet allows a person to interact with various blockchain networks, managing '
                + 'multiple wallets at the same time. Primarily though, it is the public gateway for people to interact '
                + 'with various AEN services. For more information, please visit <a _target="blank" href="https://aencoin.com" '
                + '>our main website</a> for more information.</p>'
              },
              {
                'title': 'Getting Started',
                'template': 'getting-started'
              },
              {
                'title': 'Adding more wallets',
                'subtitle': 'Adding more AEN, BTC, ETH, ERC20 wallets',
                'displayText': 'Wallets can be added from either your dashboard or the wallet management screen by clicking' +
                  'the "Add Wallet" button and choosing a network from the list.'
              }
            ]
          },
          'dashboard': {
            'title': 'The Dashboard',
            'faq': [
              {
                'title': 'What can I do from the Dashboard?',
                'youtubeVideo': 'l3ty4tdSZMY',
                'displayText': 'Lorem Ipsum'
              }
            ]
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

        if(!this.help.hasOwnProperty(this.selectedCategory)) {
          console.debug('Help could not find category definition for: ' + this.selectedCategory)
          return false
        }
        // Check to see whether there is a template associated with this help entry
        let entry = this.help[this.selectedCategory].faq[this.selectedEntry]
        console.log(entry)
        if(entry.hasOwnProperty('template')) {
          this.component = () => import('./Help/' + entry.template)
        } else {
          this.displayText = entry.displayText
          console.log('using bare faq')
          console.log(entry)
          console.log(this.displayText)
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
        this.categoryIndex = categoryIndex
        // If user clicked either the contact or about categories, special handling
        switch (this.categoryIndex) {
          case 'about':
            this.categoryComponent = () => import('./AboutUs')
            break
          case 'contact':
            this.categoryComponent = () => import('./ContactUs')
            break
          default:
            this.selectedCategory = this.categoryIndex
        }
      },
      isActiveCategory(categoryIndex) { return (categoryIndex === this.categoryIndex ? 'primary' : '') },
      isActiveEntry(entryIndex) { return (entryIndex === this.selectedEntry ? 'primary' : '') }
    }
  }
</script>
