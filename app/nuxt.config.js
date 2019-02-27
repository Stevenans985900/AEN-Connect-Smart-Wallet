const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const pkg = require('./package')

module.exports = {
  mode: 'spa',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [{
                rel: 'manifest',
                href: '/manifest.json'
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '192x192',
                href: '/android-icon-192x192.png'
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '32x32',
                href: '/favicon-32x32.png'
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '96x96',
                href: '/favicon-96x96.png'
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '16x16',
                href: '/favicon-16x16.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '57x57',
                href: '/apple-icon-57x57.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '60x60',
                href: '/apple-icon-60x60.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '72x72',
                href: '/apple-icon-72x72.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '76x76',
                href: '/apple-icon-76x76.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '114x114',
                href: '/apple-icon-114x114.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '120x120',
                href: '/apple-icon-120x120.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '144x144',
                href: '/apple-icon-144x144.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '152x152',
                href: '/apple-icon-152x152.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: '/apple-icon-180x180.png'
            },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
            }
        ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: false,

  /*
  ** Global CSS
  */
  css: [
    '@/assets/style/app.styl'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/globals.js',
    '@/plugins/addressRender.js',
    '@/plugins/businessCard.js',
    '@/plugins/clipboard.js',
    '@/plugins/feedback-tawk.js',
    '@/plugins/i18n.js',
    {
        src: '@/plugins/localStorage.js',
        ssr: false
    },
    '@/plugins/vuetify',
    '@/plugins/walletImage',
    '@/plugins/youtube'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    ['nuxt-matomo', {
      matomoUrl: '//stats.aencoin.com/',
      // trackerUrl: 'https://stats.aencoin.com/matomo.php',
      siteId: 6,
      debug: true,
      verbose: true
    }]
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build configuration
  */
  build: {
    cache: true,
    parallel: true,
    transpile: ['vuetify/lib'],
    plugins: [new VuetifyLoaderPlugin()],
    loaders: {
      stylus: {
        import: ['~assets/style/variables.styl']
      }
    },

    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      if (ctx.isClient) {
        config.node = {
            electron: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty'
        }
      }
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }

      // Check if we're in Electron and change the renderer if so
      if (process.env.hasOwnProperty('CHROME_DESKTOP') && process.env.CHROME_DESKTOP === 'Electron.desktop') {
          config.target = 'electron-renderer'
      }
    }
  }
}
