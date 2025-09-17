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
  async mounted(){
    this.$bus.$on('handleAlert',this.handleAlert)
    await this.setAnonymousMode();
  },
  computed: {
  },
  methods:{
    handleAlert(title,message,type){
      // success, warning, info, error
      this.$notify({title,message,type});
    },
    async setAnonymousMode(){
      const authToken = jsCookie.get('authToken');
      if(!authToken){
        let data;
        try{
          const res = await axios.post('/login/anonymous')
          data = res.data;
          if(data.type == 'success'){
            this.$bus.$currentUser = res.data.userInfo
            this.$bus.$emit('setUserInfo')
            // this.$router.replace(`/academic/post`).catch((e)=>{})
          }
        }
        catch(e){}
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
  img, canvas {
    -webkit-user-drag: none;
    user-select: none;
    pointer-events: none; /* 如果需要完全不能操作 */
  }
</style>
