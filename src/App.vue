<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted(){
    this.$bus.$on('handleAlert',this.handleAlert)
  },
  computed: {
  },
  methods:{
    handleAlert(title,message,type){
      // success, warning, info, error
      this.$notify({title,message,type});
    },
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
