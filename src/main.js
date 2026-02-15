import Vue from 'vue'
import App from './App.vue'
import router from './router'
Vue.config.productionTip = false

// Element UI 組件
// import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
// Vue.use(ElementUI);

import {
  Icon, Empty, Dialog, Input, InputNumber, Button, Carousel, CarouselItem, 
  Table, TableColumn, Form, FormItem, Transfer, Select, Option, DatePicker, Slider,
  Notification, MessageBox
} from 'element-ui'

Vue.prototype.$notify = Notification
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt

Vue.use(Icon)
Vue.use(Empty)
Vue.use(Dialog)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Button)
Vue.use(Carousel)
Vue.use(CarouselItem)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Transfer)
Vue.use(Select)
Vue.use(Slider)
Vue.use(Option)
Vue.use(DatePicker)


// v-lazy
Vue.directive('lazy', {
  inserted(el) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = el.dataset.src 
        observer.unobserve(el)
      }
    }, { threshold: 0.1 })

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