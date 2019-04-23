import { expect } from "chai"
import { Nuxt, Builder } from 'nuxt'

let nuxt = null
describe("index test", () => {
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
})