<template>
  <div>
    <div class="tableTitle">
        <div class="tableTitle_left">用戶總覽</div>
        <div class="tableTitle_right">
            <el-button  @click="editSelf()">編輯個人資料</el-button>
            <el-button  @click="dialogFormVisible = true">新增用戶</el-button>
        </div>
    </div>
        <el-table :data="tableData" border height="calc(100vh - 360px)" style="width: 100%" class="tableData" empty-text="暫無數據">
            <el-table-column prop="createTime" label="創建時間"></el-table-column>
            <el-table-column prop="name" label="用戶姓名"></el-table-column>
            <el-table-column prop="lastOnline" label="上次訪問時間"></el-table-column>
            <el-table-column prop="loginIP" label="登入 IP"></el-table-column>
            <el-table-column prop="status" label="狀態">
                <template v-slot="scope">
                    <div :class="scope.row.status?'valid':'invalid'">{{ scope.row.status?'有效':'凍結' }}</div>
                </template>
            </el-table-column>
            <el-table-column label="管理操作" width="250">
                <template v-slot="scope">
                    <div class="btn">
                        <el-button class="btn_link" @click="editUser(scope.row.idx)">查看</el-button>
                        <el-button class="btn_link" type="warning" @click="stopUser(scope.row.account,scope.row.idx)">{{scope.row.status?'凍結':'解凍'}}</el-button>
                        <el-button class="btn_link" type="danger" @click="deleteUser(scope.row.account,scope.row.idx)">刪除</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog title="創建用戶" :visible.sync="dialogFormVisible">
            <el-form :model="form">
                <el-form-item label="用戶帳號">
                    <el-input v-model="form.account" autocomplete="off" clearable></el-input>
                </el-form-item>
                <el-form-item label="用戶名稱">
                    <el-input v-model="form.name" autocomplete="off" clearable></el-input>
                </el-form-item>
                <el-form-item label="用戶密碼">
                    <el-input v-model="form.password" autocomplete="off" show-password clearable></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="create()">創建</el-button>
            </div>
        </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import jsCookie from 'js-cookie'
export default {
    name:'ClientTable',
    data(){
        return{
            tableData: [],
            dialogFormVisible:false,
            form:{
                account:'',
                password:'',
                name:'',
                type:'student'
            },
        }
    },
    mounted(){
        this.getData()
    },
    methods:{
        async getData(){
            const res = await axios.get('/api/infoPage/getStudent',{
                headers:{
                    'x-user-token':jsCookie.get('authToken')
                }
            })
            if(res.data.students) {
                this.tableData = res.data.students
                this.$bus.$emit('setStudentNum',this.tableData.length)
            }
            else this.$bus.$emit('handleAlert','用戶資料查詢通知',res.data.message,res.data.type)
        },
        async create(){
            const res = await axios.post('/api/infoPage/createStudent',this.form,{
                headers:{
                    'x-user-token':jsCookie.get('authToken')
                }
            })
            if(res.data.type == 'success'){
                this.getData();
                this.dialogFormVisible = false;
                this.form.account = '';
                this.form.password = '';
                this.form.name = '';
                this.$bus.$emit('handleAlert','用戶資料創建通知',res.data.message,res.data.type)
            }
            else this.$bus.$emit('handleAlert','用戶資料創建通知',res.data.message,res.data.type)
        },
        async deleteUser(account, idx){
            try{
                await this.$confirm(`確認是否刪除用戶 (${account})?`, '提示', {
                    confirmButtonText: '刪除',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                const res = await axios.delete(`/api/infoPage/deleteStudent/${idx}`,{
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    }
                })
                if(res.data.type == 'success'){
                    this.getData();
                    this.$bus.$emit('getUsageMemory')
                    this.$bus.$emit('handleAlert','用戶資料刪除通知',res.data.message,res.data.type)
                }
                else this.$bus.$emit('handleAlert','用戶資料刪除通知',res.data.message,res.data.type)
            }
            catch(e){}
        },
        async stopUser(account, idx){
            try{
                await this.$confirm(`確認是否變更用戶 (${account}) 權限?`, '提示', {
                    confirmButtonText: '刪除',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                const res = await axios.put(`/api/infoPage/stopStudent/${idx}`,{},{
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    }
                })
                if(res.data.type == 'success'){
                    this.getData();
                    this.$bus.$emit('handleAlert','用戶權限變更通知',res.data.message,res.data.type)
                }
                else this.$bus.$emit('handleAlert','用戶權限變更通知',res.data.message,res.data.type)
            }
            catch(e){}
        },
        async editSelf(){
            this.$router.push({ path: '/academic/modifyInfo', query: { idx: this.$bus.$currentUser.idx } }).catch(e => {})
        },
        async editUser(idx){
            this.$router.push({ path: '/academic/modifyInfo', query: { idx:idx } }).catch(e => {})
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
        display: flex;
        align-items: center;
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
    .btn_link{
        font-size: 14px;
    }
    .btn_link:hover{
        cursor: pointer;
    }
</style>