import Vue from 'vue'
import 'normalize.css/normalize.css'  // css重置的现代替代方法
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/index.scss'  // 全局css
import App from './App'
import store from './store'
import router from './router'
import axios from 'axios'
import '@/icons'  // 图标
import '@/permission'  // 权限控制
import { priceFilter, sexFilter, dateFilter, undefineFilter } from './utils/filters'
import * as dateUtils from './utils/dateUtils'

Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.prototype.$http = axios

Date.prototype.format = function format(pattern) {
  return dateUtils.format(this, pattern)
}

Vue.filter('sexFilter', sexFilter)
Vue.filter('priceFilter', priceFilter)
Vue.filter('dateFilter', dateFilter)
Vue.filter('undefineFilter', undefineFilter)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
