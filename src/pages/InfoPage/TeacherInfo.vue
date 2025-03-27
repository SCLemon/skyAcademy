<template>
  <div class="view">
    <div class="sum_box">
        <router-link to="clientTable" class="sum">
            <div class="sum_title">學生總數</div>
            <div class="sum_num">{{ student_num }}</div>
        </router-link>
        <router-link :to="{ path:'teacherCourseTable' }" class="sum">
            <div class="sum_title">有效課程</div>
            <div class="sum_num">1</div>
        </router-link>
        <router-link :to="''" class="sum">
            <div class="sum_title">空間用量 (MB)</div>
            <div class="sum_num">1024</div>
        </router-link>
    </div>
    <div class="table">
        <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
    name:'TeacherInfo',
    mounted(){
        this.$bus.$on('setStudentNum',this.setStudentNum)
    },
    data(){
      return{
        student_num:0,
      }
    },
    methods:{
        setStudentNum(num){
            this.student_num = num
        },
    }
}
</script>

<style scoped>
    .view{
        width: calc(100vw - 250px);
        height: 100vh;
        justify-content: space-evenly;
    }
    .sum_box{
        margin-top: 40px;
        width: 100%;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        height: 200px;
    }
    .sum{
        width: 30%;
        height: 200px;
        border-radius: 20px;
        display: block;
        text-decoration: none;
        background: linear-gradient(to top, rgb(255,255,255),rgb(100,100,100));
        background-position: bottom;
        background-size: 100% 200%;
        transition: background-position 0.5s ease-in-out;
    }
    .sum:hover{
        background-position: top;
    }
    .sum_title{
        height: 50px;
        margin-left: 20px;
        line-height: 50px;
        font-size: 20px;
        color: white;
    }
    .sum_num{
        font-size: 120px;
        height: 150px;
        line-height: 150px;
        font-weight: bolder;
        color: white;
        text-align: center;
    }
    .table{
        width: 95%;
        margin: 0 auto;
        margin-top: 20px;
    }
    .tableTitle{
        font-size: 24px;
        line-height: 85px;
    }
    .valid{
        color: lightgreen;
    }
    .invalid{
        color: rgb(170, 170, 170);
    }
    .btn{
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }
    .btn_link:hover{
        cursor: pointer;
        color: blue;
    }
    
</style>