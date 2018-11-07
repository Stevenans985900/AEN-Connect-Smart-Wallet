const webpack = require('webpack')

module.exports = {
	mode: 'spa',
	head: {
    title: 'AENChain Wallet',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '{{ description }}' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
	loading: false, // Disable default loading bar
	modules: [
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
		plugins: [
			new webpack.DefinePlugin({ "global.GENTLY": false })
		],
		vendor: [
			'vuetify'
		],
		extend (config, { isDev, isClient }) {
			// if (isDev && isClient) {
				// Run ESLint on save
				config.module.rules.push({
					enforce: 'pre',
					test: /\.(js|vue)$/,
					loader: 'eslint-loader',
					exclude: /(node_modules)/
				})
			// }
			// Extend only webpack config for client-bundle
			if (isClient) { config.target = 'electron-renderer' }
		}
	},
	dev: process.env.NODE_ENV === 'DEV',
	css: [
		'~/assets/style/app.styl',
		'~/assets/style/global.css'
	]
}
