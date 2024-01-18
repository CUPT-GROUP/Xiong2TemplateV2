import Vue from 'vue'
import App from './App.vue'
// import {Button,Dialog} from 'element-ui'
import Element from 'element-ui';

import VueSelectImage from 'vue-select-image'
Vue.use(VueSelectImage)
Vue.use(Element);
Vue.config.productionTip = false
// Vue.component(Button)
// Vue.component(Dialog)
import axios from 'axios'
Vue.prototype.$axios = axios


new Vue({
  render: h => h(App),
}).$mount('#app')
