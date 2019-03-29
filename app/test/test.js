import { Nuxt, Builder } from 'nuxt'
import { expect } from 'chai'

let nuxt = null
describe("App", function() {
  before(async function () {
    this.timeout(30000)
    const rootDir = (__dirname, '..')
    let config = {}
    try { config = require((rootDir, 'nuxt.config.js')) } catch (e) {}
    config.rootDir = rootDir // project folder
    config.dev = false // production build
    config.mode = 'universal' // Isomorphic application
    nuxt = new Nuxt(config)
    await new Builder(nuxt).build()
    nuxt.listen(4000, 'localhost')
  })
  after(function () {
    nuxt.close()
  })
  it("Builds and launches", async function() {
    let context = {}
    const { html } = await nuxt.renderRoute('/', context)
    expect(html.includes('Aenco Solutions')).to.equal(true)
  })
}).timeout(30000)

// describe('Array', function() {
//   describe('#indexOf()', function() {
//     it('should return -1 when the value is not present', function() {
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });
// import test from 'ava'
// import { resolve } from 'path'
//
// // We keep a reference to Nuxt so we can close
// // the server at the end of the test
//
//
// // Init Nuxt.js and start listening on localhost:4000
// test.before('Init Nuxt.js', async t => {
//
// }, 30000)
//
// // Example of testing only generated html
// test('Route / exits and render HTML', async t => {
// 	let context = {}
// 	const { html } = await nuxt.renderRoute('/', context)
// 	t.true(html.includes('<h1 class="red">Hello world!</h1>'))
// })
//
// // Example of testing via DOM checking
// test('Route / exits and render HTML with CSS applied', async t => {
// 	const window = await nuxt.renderAndGetWindow('http://localhost:4000/')
// 	const element = window.document.querySelector('.red')
// 	t.not(element, null)
// 	t.is(element.textContent, 'Hello world!')
// 	t.is(element.className, 'red')
// 	t.is(window.getComputedStyle(element).color, 'red')
// })
//
// // Example of testing only generated html
// test('Route / exits and render HTML', async t => {
// 	let context = {}
// 	const { html } = await nuxt.renderRoute('/', context)
// 	t.true(html.includes('Aenco Solutions Ltd'))
// })
//
// // Close the Nuxt server
// test.after('Closing server', t => {
// 	nuxt.close()
// })
//
//
