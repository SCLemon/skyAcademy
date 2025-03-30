<!-- 線上影音 -->
<template>
  <div class="view">
    <div class="header">已開通課程</div>
    <div class="classList">
      <div class="classItem" v-for="(courses,id) in courseList" :key="id">
        <div class="banner">
          <el-carousel class="carousel" width="100%" height="175px" :autoplay="false">
            <el-carousel-item v-for="(item,id) in courses.bannerImg" :key="id">
              <img :src="item.url" alt="" class="bannerImg">
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="className">{{ courses.courseName }}</div>
        <div class="classNum">{{courses.courseId}}</div>
        <div class="lecturer">{{ courses.lecturer }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsCookie from 'js-cookie';
export default {
  name:'Learn',
  data(){
    return {
      text:'',
      courseList:[]
    }
  },
  mounted(){
    this.getCourse();
  },
  methods:{
    async getCourse(){
      const token = jsCookie.get('authToken')

      if(!token) return

      const res = await axios.get('/api/learn/getCourse',{
        headers:{
          'x-user-token':token
        }
      })
      this.courseList = res.data.courses;
    }
  }
}
</script>

<style scoped>
  .view{
    width: calc(100vw - 250px);
    height: 100vh;
  }
  .header{
    height: 80px;
    width: 95%;
    line-height: 80px;
    font-size: 24px;
    margin-left: 20px;
    padding-left: 10px;
    border-bottom: 1px solid rgba(0,0,0,0.3);
  }
  .classList{
    width: 95%;
    margin: 0 auto;
    margin-left: 20px;
    margin-top: 10px;
    height: calc(100vh - 120px);
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 10px;
    /* grid */
    display: grid;
    grid-template-columns: auto auto auto;
    grid-auto-rows: 245px;
    gap: 25px;
    row-gap: 20px;
    align-items: start;

    justify-content: start;
  }
  .classItem{
    width: 350px;
    height: 245px;
    box-shadow: 1px 2px 3px gray;
    position: relative;
    transition: all 1s;
  }
  .classItem:hover{
    cursor: pointer;
    box-shadow: 4px 6px 9px gray;
  }
  .banner{
    width: 100%;
    height: 175px;
  }
  .bannerImg{
    width: 100%;
  }
  .className{
    width: 100%;
    height: 30px;
    font-size: 18px;
    line-height: 30px;
    margin-left: 10px;
    margin-top: 5px;
    overflow: hidden;
    color:rgb(64, 121, 170);    
  }
  .classNum{
    position: absolute;
    left:10px;
    font-size: 14px;
    bottom: 10px;
    color: gray;
  }
  .lecturer{
    position: absolute;
    right:10px;
    font-size: 14px;
    bottom: 10px;
    color: gray;
  }
</style>