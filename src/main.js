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
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.use(less);
Vue.use(ElementUI);
Vue.component('tree-table',TreeTable)
// 注册为全局可用
Vue.use(VueQuillEditor, /* { default global options } */)
// 配置请求的跟路径
axios.defaults.baseURL='http://www.ysqorz.top:8888/api/private/v1/';
// 设置拦截器
axios.interceptors.request.use(config=>{
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  })

Vue.filter('dateFormat',function(originVal){
  const dt=new Date(originVal)
  const y=dt.getFullYear()
  const m=(dt.getMonth()+1+'').padStart(2,'0')
  const d=(dt.getDate()+'').padStart(2,'0')

  const hh=(dt.getHours()+'').padStart(2,'0')
  const mm=(dt.getMinutes()+'').padStart(2,'0')
  const ss=(dt.getSeconds()+'').padStart(2,'0')
  
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`

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
