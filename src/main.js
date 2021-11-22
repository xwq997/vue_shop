import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import less from 'less'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';
// 导入全局样式
import './assets/css/global.css'
//导入字体图标
import './assets/fonts/iconfont.css'
// 导入树形
import TreeTable from 'vue-table-with-tree-grid'
Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.use(less);
Vue.use(ElementUI);
Vue.component('tree-table',TreeTable)
// 配置请求的跟路径
axios.defaults.baseURL='http://www.ysqorz.top:8888/api/private/v1/';
// 设置拦截器
axios.interceptors.request.use(config=>{
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  })


router.beforeEach((to,from,next)=>{
  if(to.path==='/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login') //如果没有token，强制跳转到登陆页面
  next()
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
