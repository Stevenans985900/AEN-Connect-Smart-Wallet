import test from 'ava'
import { Nuxt, Builder } from 'nuxt'
import { JSDOM } from 'jsdom'
import { resolve } from 'path'

// We keep a reference to Nuxt so we can close
// the server at the end of the test
let nuxt = null

// Init Nuxt.js and start listening on localhost:4000
test.before('Init Nuxt.js', async () => {
	const rootDir = resolve(__dirname, '..')
	let config = {}
	try { config = require(resolve(rootDir, 'nuxt.config.js')) } catch (e) {}
  config.rootDir = rootDir
	config.dev = false
  config.mode = 'spa'

  nuxt = new Nuxt(config)
  await new Builder(nuxt).build()
  await nuxt.listen(4000, 'localhost')
}, 30000)

// Example of testing only generated html
test('Route / exits and render HTML', async t => {
	const window = await nuxt.renderAndGetWindow('http://localhost:4000/')
  const element = window.document.querySelector('.v-toolbar__title')
	t.not(element, null)
  t.is(element.textContent, 'AENChain Wallet')
})

// Close the Nuxt server
test.after('Closing server', t => {
  nuxt.close()
})
