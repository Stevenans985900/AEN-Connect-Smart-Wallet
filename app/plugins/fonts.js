import Vue from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library, config } from '@fortawesome/fontawesome-svg-core'
import { faFlask } from '@fortawesome/free-solid-svg-icons'

console.log('putting in the font awesome plugion')
config.autoAddCss = false
library.add(faFlask)

// add more icon categories as you want them, even works with pro packs
// import brands from '@fortawesome/fontawesome-free-brands'

// asociate it to the library, if you need to add more you can separate them by a comma
// fontawesome.library.add(brands)
Vue.component('font-awesome-icon', FontAwesomeIcon)