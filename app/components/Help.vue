<template>
  <v-dialog
    v-model="dialogShow"
    fullscreen
  >
    <v-btn
      slot="activator"
      flat icon
    >
      <v-icon>
        help
      </v-icon>
    </v-btn>

    <v-toolbar>
      <v-img src="/logo.png" contain height="25" max-width="125px" />
      <v-toolbar-title>{{ $t('common.label.help') }}</v-toolbar-title>
      <v-spacer />
      <network-diagnostics />
      <v-btn small round outline @click="dialogShow = false">
        <v-icon>help</v-icon>&nbsp;{{ $t('help.message.click_to_return') }}
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
                :color="isActiveCategory(categoryIndex)"
                @click="chooseCategory(categoryIndex)"
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
                :color="isActiveEntry(faqIndex)"
                @click="selectedEntry = faqIndex"
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
        <v-flex xs12 md6>
          <v-layout row>
            <v-flex class="ma-2">
              <component :is="component" v-if="component !== null" />
              <template v-else>
                <youtube v-if="youtubeVideo" :video-id="youtubeVideo" player-width="100%" />
                <span>
                  {{ displayText }}
                </span>
              </template>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
  import FeedbackForm from '~/components/FeedbackForm'
  import NetworkDiagnostics from '~/components/NetworkDiagnostics'
  export default {
    components: { FeedbackForm, NetworkDiagnostics },
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
                'title': 'Summary',
                'subtitle': 'Why use the AEN Connect Smart Wallet',
                'displayText': '<p>Smart Connect allows a person to interact with various blockchain networks, managing '
                + 'multiple wallets at the same time. Primarily though, it is the public gateway for people to interact '
                + 'with various AEN services. For more information, please visit <a _target="blank" href="https://aencoin.com" '
                + '>our main website</a> for more information.</p><p>When comparing The Smart Wallet to an alternative to'
                + ' a wallet such as trust, you would want to choose Smart Connect in the event you need to interact with' +
                  ' AEN services.</p>'
              },
              {
                'title': 'Getting Started',
                'template': 'getting-started'
              },
              {
                'title': 'Adding more wallets',
                'subtitle': 'AEN, BTC, ETH, ERC20 wallets',
                'displayText': 'Wallets can be added from either your dashboard or the wallet management screen by clicking' +
                  'the "Add Wallet" button and choosing a network from the list. By default, you are able to add AEN, Bitcoin,' +
                  ' Ethereum, and Smart Contracts (Ethereum ERC20/223) as wallets to this app. In the case of adding Smart Contracts' +
                  'manually , it is necessary to add an Ethereum wallet before the option unlocks in order to act as the managing wallet.' +
                  'If you already own an Ethereum wallet which has control of smart contracts, they should be automatically imported as wallets' +
                  'during wallet history update.'
              }
            ]
          },
          'dashboard': {
            'title': 'The Dashboard',
            "icon": "apps",
            'faq': [
              {
                'title': 'Summary',
                "subtitle": "What can you do from the dashboard?",
                'youtubeVideo': 'l3ty4tdSZMY',
                'displayText': 'The dashboard is your landing area which provides a high level look at all your managed' +
                  'wallets, providing a real world currency evaluation along the way, and a gateway to various AEN services' +
                  ' including the Exchange, Investment opportunities, The Service runner platform, and security centre'
              }
            ]
          },
          'wallet': {
            'title': 'Wallet Management',
            "icon": "settings_system_daydream",
            "faq": [
              {
                "title": "What networks are supported?",
                "template": "supported-networks"
              },
              {
                "title": "Where are my tokens stored?",
                "displayText": "Your tokens are stored on the blockchain network. Using this wallet as an interface and " +
                  "the private keys for each wallet, transactions and operations are carried out on the tokens through " +
                  "an external API which acts as an ingress to the blockchain network"
              },
              {
                "title": "Backing up a wallet",
                "displayText": "Wallet backups are created from the wallet management screen. Once clicking the backup " +
                  "wallet button, you will be asked which wallets you want to backup. After clicking on a wallet, two " +
                  "files will be downloaded: A plaintext JSON file and an encrypted version of the same file that can " +
                  "only be opened using this wallet. The credentials part of this backup are encrypted for your security."
              },
              {
                "title": "Restoring a wallet",
                "displayText": "The option to choose restoring a wallet from file is available whenever you click the add " +
                  "wallet button from either the dashboard or wallet management screen. In step one of adding a wallet, " +
                  "you are asked how you would like to setup your wallet. At this point, choose the 'import from file' " +
                  "option, then during part 2, simply choose the file from your device and it will be imported."
              }
            ]
          },
          'contacts': {
            'title': 'Address Book',
            "icon": "contacts",
            "faq": [
              {
                "title": "Summary",
                "subtitle": "What's the purpose of the address book?",
                "displayText": "Addresses used on the various blockchain networks are long and complicated, often over 40 " +
                  "characters long. The address book provides a way of defining aliases for each address so, when it comes " +
                  "to reviewing transaction histories or making a transaction yourself, the source / destination can quickly " +
                  "be identified."
              }
            ]
          },
          'security': {
            'title': 'Security',
            "icon": "lock_open",
            "faq": [
              {
                "title": "Summary",
                "subtitle": "Overview of how you are kept safe",
                "displayText": "Encryoted cookie store, extra encryption on top of credentials, one way password hashes, " +
                  "user challenges depending on action, master password"
              }
            ]
          },
          'network': {
            'title': 'Connectivity',
            "icon": "network_check",
            "faq": [
              {
                "title": "Summary",
                "subtitle": "Communicating with multiple networks",
                "displayText": "Speak to API points only when need to, if offline will return cached results, connectivity " +
                  "indicator in top toolbar, automatic API rotation choosing device with best response times"
              },
              {
                "title": "I can't make any transfers",
                "displayText": "This app works both offline and online. When offline however, all functionality tied " +
                  "to the network (which is almost everything) is disabled to prevent both errors and confusion. If you " +
                  "can't make any transfers, it is possible that the app believes itself to be offline. If this is the " +
                  "case, then the network icon in the top right of your toolbar will display as a red wifi graph with a " +
                  "line through it"
              }
            ]

          },
          'about': {
            'title': 'About',
            "icon": "face"
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
      mounted() {
        // Get up to date status for each network
        this.$store.dispatch('wallet/queryApiNode', 'aen')
        this.$store.dispatch('wallet/queryApiNode', 'btc')
        // this.$store.dispatch('wallet/queryApiNode', 'eth')
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
          default:
            this.selectedCategory = this.categoryIndex
        }
      },
      isActiveCategory(categoryIndex) { return (categoryIndex === this.categoryIndex ? 'primary' : '') },
      isActiveEntry(entryIndex) { return (entryIndex === this.selectedEntry ? 'primary' : '') }
    }
  }
</script>
