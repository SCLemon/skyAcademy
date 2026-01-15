<template>
  <div class="column_box">
    <div class="header">
      <div class="title"><i class="fa-solid fa-folder-open title_icon"></i>專欄列表</div>
      <div class="searchBox">
        <i class="fa-solid fa-magnifying-glass search_icon"></i><input type="text" class="search" placeholder="關鍵字查詢（主題, 代號, 作者名,...）" v-model="search">
      </div>
    </div>
    <div class="classList" v-if="searchCourse.length">
      <div class="classItem" v-for="(courses,id) in searchCourse" :key="id" @click="courses.idx?goToColumn(courses.idx):handleLockMsg('若要開啟此專欄，請逕行向版主申請。')">
        <div class="banner">
          <el-carousel class="carousel" width="100%" height="175px" :autoplay="false">
            <el-carousel-item v-for="item in courses.bannerImg" :key="item.url">
              <img src="img/Loading.gif" :data-src="item.url" alt="" v-lazy class="bannerImg" loading="lazy">
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="classNameBox"><div class="className">{{ courses.courseName }}</div><i v-if="courses.lock" class="fa-solid fa-lock course_lock"></i></div>
        <div class="classNum">{{courses.courseId}}</div>
        <div class="lecturer">{{ courses.lecturer }}</div>
      </div>
    </div>
    <div class="classList_empty" v-else>
      <el-empty description="暫無專欄"></el-empty>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsCookie from 'js-cookie';
export default {
  name:'ColumnList',
  data(){
    return {
      search:'',
      courseList:[]
    }
  },
  mounted(){
    this.getCourse();
  },
  computed:{
    searchCourse() {
      const keyword = this.search.trim().toLowerCase();
      if (!keyword) return this.courseList;

      return this.courseList.filter(course => {
        return course.courseName.toLowerCase().includes(keyword) ||
              course.courseId.toLowerCase().includes(keyword) ||
              course.lecturer.toLowerCase().includes(keyword)
      });
    }
  },
  methods:{
    handleLockMsg(text){
      this.$bus.$emit('handleAlert','專欄權限通知',text, 'warning');
    },
    async getCourse(){
      const token = jsCookie.get('authToken')

      if(!token) return

      const res = await axios.get('/api/learn/getCourse',{
        headers:{
          'x-user-token':token
        }
      })
      const data = res.data;
      if(data.type == 'success'){
        this.courseList = data.courses;
      }
      else this.$bus.$emit('handleAlert','專欄資料查詢通知',res.data.message,res.data.type)
    },
    goToColumn(idx){
      this.$router.push(`column/${idx}`).catch(e=>{})
    },
  }
}
</script>

<style scoped>
  .column_box{
    width: calc(100vw - 250px);
    height: 100vh;
    box-sizing: border-box;
  }
  .header{
    height: 80px;
    width: 95%;
    line-height: 80px;
    font-size: 24px;
    margin-left: 20px;
    padding-left: 10px;
    position: relative;
    font-weight: bolder;
  }
  .title_icon{
    margin-right: 12px;
  }
  .searchBox{
    height: 40px;
    width: 400px;
    position: absolute;
    top:20px;
    right: 0px;
    display: flex;
    align-items: center;
    justify-content: left;
    box-shadow: 0px 1px 3px gray;
    border-radius: 40px;
    box-sizing: border-box;
  }
  .search_icon{
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    font-size: 16px;
    color: rgba(0,0,0,0.4);
  }
  .search{
    width: 340px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    box-sizing: border-box;
    border: none;
    margin-right: 20px;
  }
  .search:focus{
    outline: none;
  }
  .search::placeholder{
    font-size: 14px;
  }
  .classList{
    width: 95%;
    margin: 0 auto;
    margin-left: 20px;
    height: calc(100vh - 120px);
    overflow-x: hidden;
    overflow-y: scroll;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    box-sizing: border-box;
    /* grid */
    display: grid;
    grid-template-columns: repeat(auto-fill, 350px);
    grid-auto-rows: 245px;
    gap: 25px;
    row-gap: 20px;
    align-items: start;
    justify-content: start;
  }
  .classList_empty{
    width: 100%;
    height: calc(100vh - 81px);
    display: flex;
    justify-content: center;
    align-items: center;
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
    height: 100%;
    object-position: center;
    object-fit: cover;
  }
  .classNameBox{
    width: 100%;
    position: relative;
    box-sizing: border-box;
  }
  .className {
    width: 80%;
    height: 30px;
    font-size: 18px;
    line-height: 30px;
    padding-left: 10px;
    margin-top: 5px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgb(64, 121, 170);
  }
  .course_lock{
    position: absolute;
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: gray;
    top:0;
    right: 10px;
  }
  .classNum{
    position: absolute;
    width: 45%;
    overflow: hidden;
    left:10px;
    font-size: 14px;
    height: 18px;
    line-height: 18px;
    bottom: 8px;
    color: gray;
    box-sizing: border-box;
  }
  .lecturer{
    position: absolute;
    right:10px;
    font-size: 14px;
    height: 18px;
    line-height: 18px;
    bottom: 8px;
    color: gray;
    width: 45%;
    overflow: hidden;
    box-sizing: border-box;
    text-align: right;
  }
  ::v-deep .el-carousel__indicator{
    display: none;
  }

  @media screen and (max-width: 440px) {
    .column_box{
      width: 95vw;
      margin: 0 auto;
      margin-top: 20px;
    }
    .title{
      display: none;
    }
    .header{
      width: 100%;
      height: 50px;
      margin-left: 0;
      margin-bottom: 20px;
      padding-left: 0;
      position: static;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .searchBox{
      width: 100%;
      height: 50px;
      position: static;
    }
    .search_icon{
      margin-left: 5px;
      margin-right: 5px;
    }
    .search{
      line-height: 40px;
      width: 300px;
      margin-right: 10px;
    }
    .classList{
      margin: 0 auto;
      width: 100%;
      height: calc(100vh - 80px);
      justify-content: center;
      padding-bottom: 120px;
      padding-left: 0;
      padding-right: 0;
    }
    .classItem{
      margin: 0 auto;
      margin-bottom: 20px;
    }

  }
</style>