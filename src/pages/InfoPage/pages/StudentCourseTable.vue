<template>
    <div>
    <div class="tableTitle">
        <div class="tableTitle_left">專欄總覽</div>
    </div>
        <el-table :data="tableData" border height="calc(100vh - 360px)" style="width: 100%" class="tableData" empty-text="暫無數據">
            <el-table-column prop="createTime" label="創建時間"></el-table-column>
            <el-table-column prop="courseId" label="專欄代碼"></el-table-column>
            <el-table-column prop="courseName" label="專欄名稱"></el-table-column>
            <el-table-column prop="lecturer" label="專欄負責人"></el-table-column>
            <el-table-column prop="status" label="狀態">
                <template v-slot="scope">
                    <div :class="scope.row.status?'valid':'invalid'">{{ scope.row.status?'公開':'不公開' }}</div>
                </template>
            </el-table-column>
            <el-table-column label="專欄通道" width="250">
                <template v-slot="scope">
                    <div class="btn" @click="scope.row.status?goToCourse(scope.row.idx):''">{{ scope.row.status?'進入專欄':'目前無法進入專欄' }}</div>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import axios from 'axios'
import jsCookie from 'js-cookie'
export default {
    name:'StudentCourseTable',
    data(){
        return{
            tableData: [],
        }
    },
    mounted(){
        this.getCourseList()
    },
    methods:{
        goToCourse(idx){
            this.$router.push({
                path:'/academic/class',
                query:{
                    idx:idx
                }
            }).catch((e)=>{})
        },
        async getCourseList(){
            const res = await axios.get('/api/infoPage/getStudentCourse',{
                headers:{
                    'x-user-token':jsCookie.get('authToken')
                }
            })
            if(res.data.courses) {
                this.tableData = res.data.courses
                this.$bus.$emit('setCourseNum',this.tableData.length)
            }
            else this.$bus.$emit('handleAlert','課程資料查詢通知',res.data.message,res.data.type)
        },

    }
}
</script>

<style scoped>
    .table{
        width: 95%;
        margin: 0 auto;
        margin-top: 20px;
    }
    .tableTitle{
        line-height: 85px;
        text-align: center;
        display: flex;
        align-items: center;
    }
    .tableTitle_left{
        float: left;
        font-size: 24px;
    }
    .tableTitle_right{
        height: 40px;
        text-align: center;
        /* 放置最右邊 */
        margin-left: auto;
        font-size: 14px;
    }
    .tableTitle_right:hover{
        cursor: pointer;
        color: blue;
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
    .btn:hover{
        cursor: pointer;
    }
</style>