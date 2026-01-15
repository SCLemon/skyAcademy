<template>
  <div class="body">
    <div class="menu_wrapper" v-if="!$isMobile">
      <Menu :userInfo="userInfo"></Menu>
    </div>
    <div class="menu_mobile_wrapper" v-if="$isMobile && showMobileOption">
      <Menu_Mobile :userInfo="userInfo"></Menu_Mobile>
    </div>
    <div class="view">
      <transition name="slide-fade">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
import Menu from '../../components/Menu/Menu.vue'
import Menu_Mobile from '@/components/Menu/Menu_Mobile.vue';
import jsCookie from 'js-cookie'
import axios from 'axios'
export default {
  name:'Academic',
  components:{
    Menu, Menu_Mobile
  },
  data(){
    return {
      userInfo:{
        account:'',
        name:'',
        userImgUrl:'',
        typeEng:'',
        type:''
      },
      text:''
    }
  },
  async mounted(){
    this.$bus.$on('setUserInfo',this.setUserInfo)
    this.$bus.$on('updateCurrentUser',this.updateCurrentUser)
    await this.checkToken()
  },
  computed:{
    showMobileOption(){
        return !Object.values(this.userInfo).some(value => value === null || value === undefined || value === '')
    }
  },
  methods:{
    async checkToken(){
      const token = jsCookie.get('authToken')

      if(!token) return

      const res = await axios.post('/login/token',{save:true},{
        headers:{
          'x-user-token':token,
          'x-user-fingerprint':localStorage.getItem('deviceFingerprint')
        }
      })
      if(res.data.type == 'success'){
        localStorage.setItem('currentUser', JSON.stringify(res.data.userInfo))
        this.setUserInfo();
      }
      else {
        jsCookie.remove('authToken');
        localStorage.removeItem('currentUser')
        this.$bus.$emit('handleAlert','使用者權限異常通知',res.data.message,res.data.type)
      }
    },

    // 呼叫此方法的函式若已執行驗證或已知判斷結果，可直接跳過 updateCurrentUser()
    setUserInfo(){
      const userInfo = JSON.parse(localStorage.getItem('currentUser'))
      if(userInfo){
        userInfo.userImgUrl += `?${new Date().getTime()}`
        this.userInfo = userInfo;
      }
      else {
        this.userInfo = { account:'', name:'', userImgUrl:'',typeEng:'',type:''};
      }
    },
    
    async updateCurrentUser(){
      const token = jsCookie.get('authToken')
      const res = await axios.post('/login/token',{save:true},{
        headers:{
          'x-user-token':token,
          'x-user-fingerprint':localStorage.getItem('deviceFingerprint')
        }
      })
      if(res.data.type == 'success'){
        this.$bus.$currentUser = JSON.parse(localStorage.getItem('currentUser'))
        this.setUserInfo();
      }
    },
  }
}
</script>

<style scoped>
  .body{
    display: flex;
    position: relative;
  }
  .menu_wrapper{
    width: 250px;
    height: 100vh;
  }
  .view{
    width: calc(100vw - 250px);
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
  @media screen and (max-width: 440px) {
    .menu_wrapper{
      display: none;
    }
    .view{
      width: 100vw;
    }
    .menu_mobile_wrapper{
      position: fixed;
      width: 90vw;
      height: auto;
      bottom: 30px;
      margin: 0 auto;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
    }
  }
</style>