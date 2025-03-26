<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import jsCookie from 'js-cookie'
import axios from 'axios'
export default {
  name: 'App',
  mounted(){
    this.$bus.$on('handleAlert',this.handleAlert)
    this.checkToken()
  },
  methods:{
    handleAlert(title,message,type){
      // success, warning, info, error
      this.$notify({title,message,type});
    },
    async checkToken(){
      const token = jsCookie.get('authToken')

      if(!token) return

      const res = await axios.post('/login/token',{},{
        headers:{
          'x-user-token':token
        }
      })
      if(res.data.type == 'success') this.$bus.$emit('setUserInfo',res.data.userInfo)
      else {
        jsCookie.remove('authToken');
        this.$bus.$emit('handleAlert',res.data.message,res.data.type)
      }
    }
  }
}
</script>

<style>
::-webkit-scrollbar{
  display: none;
}
#app {
  overflow: hidden;
}
</style>
