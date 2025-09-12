<template>
  <div class="view">
    <div class="sum_box">
        <router-link to="clientTable" class="sum">
            <div class="sum_title">用戶總數 (上限 {{ limit.studentNum }} 人)</div>
            <div class="sum_num">{{ student_num }}</div>
        </router-link>
        <router-link :to="{ path:'teacherCourseTable' }" class="sum">
            <div class="sum_title">專欄總數 (上限 {{ limit.classNum }} 堂)</div>
            <div class="sum_num">{{ course_num }}</div>
        </router-link>
        <router-link :to="''" class="sum">
            <div class="sum_title">空間用量 (上限 {{ limit.memory }} MB)</div>
            <div class="sum_num">{{ usage_memory }}</div>
        </router-link>
    </div>
    <div class="table">
        <router-view></router-view>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import jsCookie from 'js-cookie'
export default {
    name:'TeacherInfo',
    async mounted(){
        this.$bus.$on('setStudentNum',this.setStudentNum)
        this.$bus.$on('setCourseNum',this.setCourseNum)
        this.$bus.$on('getUsageMemory',this.getUsageMemory)
        this.initialize()
    },
    data(){
      return{
        student_num:0,
        course_num:0,
        usage_memory:0,
        limit:{
            memory:0,
            studentNum:0,
            classNum:0
        }
      }
    },
    methods:{
        // 初始化
        initialize(){
            this.getUsageMemory()
            this.getStudent()
            this.getCourse()
        },
        setStudentNum(num){
            this.student_num = num
        },
        setCourseNum(num){
            this.course_num = num
        },
        async getCourse(){
            try{
                const res = await axios.get('/api/infoPage/getCourse',{headers:{'x-user-token':jsCookie.get('authToken')}})
                if(res.data.courses) this.course_num = res.data.courses.length
            }
            catch(e){}
        },
        async getStudent(){
            try{
                const res = await axios.get('/api/infoPage/getStudent',{headers:{'x-user-token':jsCookie.get('authToken')}})
                if(res.data.students) this.student_num = res.data.students.length
            }
            catch(e){}
        },
        async getUsageMemory(){
            const res = await axios.get('/api/getUsageMemory',{
                headers:{
                    'x-user-token':jsCookie.get('authToken')
                }
            })
            if(res.data.type == 'success'){
                if(res.data.size<100) this.usage_memory = parseFloat(res.data.size).toFixed(2)
                else if(res.data.size<1000) this.usage_memory = parseFloat(res.data.size).toFixed(1)
                else  this.usage_memory = parseInt(res.data.size)
                this.limit = res.data.limit;
            }
            else this.$bus.$emit('handleAlert','儲存空間資訊通知',res.data.message,res.data.type)
        }
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