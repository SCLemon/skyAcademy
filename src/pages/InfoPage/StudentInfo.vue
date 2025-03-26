<template>
  <div class="view">
    <div class="sum_box">
        <div class="sum">
            <div class="sum_title">已開通課程</div>
            <div class="sum_num">1</div>
        </div>
        <div class="sum">
            <div class="sum_title">有效課程</div>
            <div class="sum_num">1</div>
        </div>
        <div class="sum">
            <div class="sum_title">失效課程</div>
            <div class="sum_num">0</div>
        </div>
    </div>
    <div class="table">
        <div class="tableTitle">課程總覽</div>
        <el-table :data="tableData" border height="calc(100vh - 360px)" style="width: 100%" class="tableData">
            <el-table-column prop="date" label="開課時間"></el-table-column>
            <el-table-column prop="course_id" label="課程代碼"></el-table-column>
            <el-table-column prop="course_name" label="課程名稱"></el-table-column>
            <el-table-column prop="teacher" label="授課教師"></el-table-column>
            <el-table-column prop="status" label="狀態">
                <template v-slot="scope">
                    <div :class="scope.row.status?'valid':'invalid'">{{ scope.row.status?'有效':'失效' }}</div>
                </template>
            </el-table-column>
            <el-table-column label="管理操作">
                <template v-slot="scope">
                    <div class="btn">
                        <div class="btn_link" @click="goToCourse(scope.row.course_id)">進入課程</div>
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </div>
  </div>
</template>

<script>
export default {
    name:'StudentInfo',
    data(){
        return{
            tableData: [{
                date: '2025-03-26',
                course_id: 'SC31001',
                course_name: '高中物理全',
                teacher:'SCLemon',
                status: true,
            }]
        }
    },
    methods:{
        goToCourse(course_id){
            this.$bus.$emit('handleAlert','test',course_id,'success')
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
        background: linear-gradient(to top, rgb(255,255,255),rgb(100,100,100));
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