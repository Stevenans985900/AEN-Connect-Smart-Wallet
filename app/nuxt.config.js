const webpack = require('webpack')

module.exports = {
	mode: 'spa',
	head: {
    title: 'AENChain Wallet',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '{{ description }}' },
			{ name: 'msapplication-TileColor', content: '#ffffff' },
			{ name: 'msapplication-TileImage', content: '/ms-icon-144x144.png' },
			{ name: 'theme-color', content: '#ffffff' }
    ],
    link: [
			{ rel: 'manifest', href: '/manifest.json' },
			{ rel: 'icon', type: 'image/png',  sizes: '192x192', href: '/android-icon-192x192.png' },
			{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
			{ rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
			{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
			{ rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-icon-57x57.png' },
			{ rel: 'apple-touch-icon', sizes: '60x60', href: '/apple-icon-60x60.png' },
			{ rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-icon-72x72.png' },
			{ rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-icon-76x76.png' },
			{ rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-icon-114x114.png' },
			{ rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-icon-120x120.png' },
			{ rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-icon-144x144.png' },
			{ rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-icon-152x152.png' },
			{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-icon-180x180.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
	loading: false, // Disable default loading bar
	mode: 'spa',
	modules: [
		'@nuxtjs/dotenv',
    '@nuxtjs/axios'
  ],
  plugins: [
    '~/plugins/globals.js',
    { src: '~/plugins/localStorage.js', ssr: false },
		'~/plugins/vuetify',
		'~/plugins/wallet'
  ],
	build: {
		extractCSS: true,
		transpile: [/^vuetify/],
		plugins: [
			new webpack.DefinePlugin({ "global.GENTLY": false })
		],
		vendor: [
			'vuetify'
		],
		extend (config, { isDev, isClient }) {
			if (isClient) {
        config.node = {
					electron: 'empty',
          fs: 'empty',
          net: 'empty',
          tls: 'empty',
          child_process: 'empty'
        }
      }
			if (isDev && isClient) {
				// Run ESLint on save
				config.module.rules.push({
					enforce: 'pre',
					test: /\.(js|vue)$/,
					loader: 'eslint-loader',
					exclude: /(node_modules)/
				})
			}

			// Check if we're in Electron and change the renderer if so
			if (process.env.hasOwnProperty('CHROME_DESKTOP') && process.env.CHROME_DESKTOP === 'Electron.desktop') {
				console.log('Building for Electron')
        config.target = 'electron-renderer'
			}
    }
	},
	dev: process.env.NODE_ENV === 'DEV',
	env: {
		baseUrl: process.env.BASE_URL || 'http://localhost:3000'
	},
	css: [
		'~/assets/style/app.styl',
		'~/assets/style/global.css'
	]
}
