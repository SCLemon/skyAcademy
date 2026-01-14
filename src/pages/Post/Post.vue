<!-- 發文帖子 -->
<template>
  <div class="view">
    <div class="posterContainer">
      <router-view class="router_view"></router-view>
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
  .router_view{
    width: 73%;
    max-width: calc((100vw - 560px) * 0.73);
    margin-top: 20px;
    height: 100vh;
    box-sizing: border-box;
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
  @media screen and (max-width: 440px) {
    .router_view{
      width: 95vw;
      max-width: 95vw;
    }
    .column{
      display: none;
    }
  }
</style>