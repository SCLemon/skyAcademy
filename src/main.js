import Vue from 'vue'

import App from './App.vue'
import router from './router'
Vue.config.productionTip = false

// Element UI 組件
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// v-lazy
Vue.directive('lazy', {
  inserted(el) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = el.dataset.src 
        observer.unobserve(el)
      }
    }, { threshold: 0 })

    observer.observe(el)
  }
})


new Vue({
  render: h => h(App),
  router,
  beforeCreate(){
    // 全局事件總線
    Vue.prototype.$bus = this;
  } 
}).$mount('#app')
