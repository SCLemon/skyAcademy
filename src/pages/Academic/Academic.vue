<template>
  <div class="body">
    <Menu></Menu>
    <router-view></router-view>
  </div>
</template>

<script>
import Menu from '../../components/Menu/Menu.vue'
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

  },
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
</style>