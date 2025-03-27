<template>
  <div>
    <div class="tableTitle">課程總覽</div>
        <el-table :data="tableData" border height="calc(100vh - 360px)" style="width: 100%" class="tableData" empty-text="暫無數據">
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
</template>

<script>
export default {
    name:'StudentCourseTable',
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
    mounted(){

    },
    methods:{
        getData(){
            
        },
        goToCourse(course_id){
            this.$bus.$emit('handleAlert','test',course_id,'success')
        }
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