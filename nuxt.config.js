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
	mode: 'spa',
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
			if (
				typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer'
				|| typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron
				|| typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0
			) {
        config.target = 'electron-renderer'
			}
    }
	},
	dev: process.env.NODE_ENV === 'DEV',
	css: [
		'~/assets/style/app.styl',
		'~/assets/style/global.css'
	]
}
