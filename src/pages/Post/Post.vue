<!-- 發文帖子 -->
<template>
  <div class="view">
    <div class="posterContainer">
      <router-view></router-view>
      <div class="column">
          <self-intro></self-intro>
      </div>
    </div>
  </div>
</template>

<script>
import SelfIntro from './components/SelfIntro.vue';
export default {
  name:'Post',
  components:{
    SelfIntro
  }
}
</script>

<style scoped>
  .view{
    width: calc(100vw - 250px);
    height: 100vh;
  }
  .posterContainer{
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: space-evenly;
  }
  .column{
    width: 310px;
    height: 100vh;
    padding-top: 20px;
    box-sizing: border-box;
  }
</style>