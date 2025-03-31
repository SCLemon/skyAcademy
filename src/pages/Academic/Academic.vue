<template>
  <div class="body">
    <Menu></Menu>
    <transition name="slide-fade">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import Menu from '../../components/Menu/Menu.vue'
import jsCookie from 'js-cookie'
import axios from 'axios'
export default {
  name:'Academic',
  components:{
    Menu
  },
  data(){
    return {
      text:''
    }
  },
  mounted(){
    this.checkToken()
  },
  methods:{
    async checkToken(){
      const token = jsCookie.get('authToken')

      if(!token) return

      const res = await axios.post('/login/token',{save:true},{
        headers:{
          'x-user-token':token
        }
      })
      if(res.data.type == 'success') this.$bus.$emit('setUserInfo',res.data.userInfo)
      else {
        jsCookie.remove('authToken');
        this.$bus.$emit('handleAlert','使用者權限異常通知',res.data.message,res.data.type)
      }
    }
  }
}
</script>

<style scoped>
  .body{
    display: flex;
  }
  .view{
    width: calc(100vw - 250px);
    min-width: 1190px;
    height: 100vh;
  }
  .slide-fade-enter-active {
    transition: opacity .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }

  .slide-fade-leave-active {
    display: none;
  }

  .slide-fade-enter {
    /* transform: translateX(100%); */
    opacity: 0;
  }

  .slide-fade-leave-to {
    /* transform: translateX(100%); */
    opacity: 0;
  }
</style>