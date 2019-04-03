import chai from 'chai'
import expect from 'chai/register-expect'
import test from 'ava'
import { mount } from '@vue/test-utils'
import TokenValue from '../../components/TokenValue'

let wrapper

const list = ['Coffee', 'Tea', 'Snicker', 'Mars']

test.beforeEach(() => {
  wrapper = mount(TokenValue, {
    propsData: {
      type: "aen",
      value: 10000
    }
  })
})

test('List.vue shapshow', (t) => {
  t.snapshot({ html: wrapper.html() })
})

test('List.vue to display list', (t) => {
  expect(wrapper.contains('AEN')).to.equal(true)

})