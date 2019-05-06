const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const pkg = require('./package')

let imageBasePath = '/'
if(process.env.hasOwnProperty('BUILD_TARGET') && process.env.BUILD_TARGET === 'android') {
  imageBasePath = '/android_asset/www/'
}

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
      { hid: 'description', name: 'description', content: pkg.description },
      { "cache-control": "no-cache;" }
    ],
    noscript: [{ innerHTML: 'This application requires JavaScript in order to run, please enable JavaScript or disable your blocker to proceed.' }],
    link: [{
                rel: 'manifest',
                href: '/manifest.json'
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '192x192',
                href: imageBasePath+'android-icon-192x192.png'
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '32x32',
                href: imageBasePath+'favicon-32x32.png'
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '96x96',
                href: imageBasePath+'favicon-96x96.png'
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '16x16',
                href: imageBasePath+'favicon-16x16.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '57x57',
                href: imageBasePath+'apple-icon-57x57.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '60x60',
                href: imageBasePath+'apple-icon-60x60.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '72x72',
                href: imageBasePath+'apple-icon-72x72.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '76x76',
                href: imageBasePath+'apple-icon-76x76.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '114x114',
                href: imageBasePath+'apple-icon-114x114.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '120x120',
                href: imageBasePath+'apple-icon-120x120.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '144x144',
                href: imageBasePath+'apple-icon-144x144.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '152x152',
                href: imageBasePath+'apple-icon-152x152.png'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: imageBasePath+'apple-icon-180x180.png'
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
    // '@fortawesome/fontawesome-svg-core/styles.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/addressRender',
    '@/plugins/businessCard',
    '@/plugins/clipboard',
    '@/plugins/feedback-tawk',
    // '@/plugins/fonts',
    '@/plugins/globals',
    '@/plugins/i18n',
    {
        src: '@/plugins/localStorage',
        ssr: false
    },
    '@/plugins/logger',
    '@/plugins/tokenValue',
    '@/plugins/transactionStringify',
    '@/plugins/vuebar',
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
      matomoUrl: 'https://stats.aencoin.com/',
      // trackerUrl: 'https://stats.aencoin.com/matomo.php',
      siteId: 6,
      debug: false,
      verbose: false
    }]
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    rejectUnauthorized: false
  },
  generate: {
    dir: 'www'
  },
  router: {
      mode: 'hash'
  },
  /*
  ** Build configuration
  */
  build: {
    babel: {
      babelrc: true
    },
    quiet: false,
    cache: true,
    parallel: true,
    transpile: ['vuetify/lib'],
    plugins: [new VuetifyLoaderPlugin()],
    publicPath: '/nuxt/',
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

      config.module.rules.push({
        test: /\.(png|jpeg|gif|svg)$/i,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: 'img/[name].[hash:7].[ext]',
          outputPath: "img/"
        }
      })

      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        console.log('compiling eslit code')
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }

      if(process.env.hasOwnProperty('BUILD_TARGET') && process.env.BUILD_TARGET === 'android') {
        console.log('BUILDING FOR ANDROID')
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
        // config.output.publicPath = '/nuxt/'
      }

      // Check if we're in Electron and change the renderer if so
      if (process.env.hasOwnProperty('CHROME_DESKTOP') && process.env.CHROME_DESKTOP === 'Electron.desktop') {
        console.log('building for electron')
          config.target = 'electron-renderer'
      }
    }
  }
}
