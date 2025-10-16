<template>
  <div>
    <div class="top">
      <div class="title">每日學習紀錄簿</div>
      <el-button class="add" v-if="currentUser && currentUser.typeEng == 'teacher'" @click="dialogFormVisible = true">新增計畫</el-button>
    </div>
    <statistics class="statistics"></statistics>
    <div class="table">
        <el-table :data="tableData" border height="calc(100vh - 505px)" style="width: 100%" class="tableData" empty-text="暫無數據">
          <el-table-column prop="date" label="計畫日期" width="180px"></el-table-column>
          <el-table-column label="學習計畫概要">
            <template v-slot="scope">
                <div class="project_detail">{{scope.row.content}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="totalTime" label="執行時間統計" width="180px">
            <template v-slot="scope">
                <div >{{ scope.row.record?.statistics?total : 0 }} min</div>
            </template>
          </el-table-column>
          <el-table-column label="其他操作" width="255px">
            <template v-slot="scope">
                <template v-if="currentUser && currentUser.typeEng == 'teacher'">
                  <el-button>執行</el-button>
                  <el-button type="warning" @click="openUpdate(scope.row)">修改</el-button>
                  <el-button type="danger" @click="deleteProject(scope.row.idx)">刪除</el-button>
                </template>
                <template v-else>無權限進行操作</template>
            </template>
          </el-table-column>
        </el-table>
    </div>
    <el-dialog title="新增計畫" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="計畫日期">
          <el-input v-model="form.date" autocomplete="off" clearable :placeholder="`${today}`"></el-input>
        </el-form-item>
        <el-form-item label="學習計畫概要">
          <el-input v-model="form.content" autocomplete="off" clearable></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" class="create" :disabled="(form.date.trim() =='' ||form.content.trim()=='')" @click="(form.date.trim() =='' ||form.content.trim()=='')?'':create()">新增計畫</el-button>
    </el-dialog>
    <el-dialog title="修改計畫" :visible.sync="dialogFormVisible2">
      <el-form :model="form">
        <el-form-item label="計畫日期">
          <el-input v-model="updateForm.date" autocomplete="off" clearable :placeholder="`${today}`"></el-input>
        </el-form-item>
        <el-form-item label="學習計畫概要">
          <el-input v-model="updateForm.content" autocomplete="off" clearable></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" class="create" :disabled="(updateForm.date.trim() =='' ||updateForm.content.trim()=='')" @click="(updateForm.date.trim() =='' ||updateForm.content.trim()=='')?'':update()">修改計畫</el-button>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import Statistics from './components/Statistics.vue';
import jsCookie from 'js-cookie';
import {format} from 'date-fns'
export default {
    name:'StudyRoom',
    components:{
      Statistics
    },
    data(){
      return{
        today:format(new Date(), 'yyyy-MM-dd'),
        currentUser:{},
        tableData:[],

        // 新增
        dialogFormVisible:false,
        form:{
          date:'',
          content:''
        },
        // 修改
        dialogFormVisible2:false,
        updateIdx:'',
        updateForm:{
          date:'',
          content:''
        }
      }
    },
    mounted(){
      this.currentUser = this.$bus.$currentUser
      this.getData();
    },
    methods:{
      async getData(){
        try{
          const res = await axios.get('/api/studyRecord/getRecord',{
            headers:{
              'x-user-token':jsCookie.get('authToken')
            }
          })
          if(res.data.type == 'success'){
            this.tableData = res.data.record;
          }
          else this.$bus.$emit('handleAlert','資料汲取通知',res.data.message, res.data.type)
        }
        catch(e){}
      },
      async create(){
        try{
          const res = await axios.post('/api/studyRecord/create', this.form,{
            headers:{
              'x-user-token':jsCookie.get('authToken')
            }
          })
          if(res.data.type == 'success'){
            await this.getData();
            this.dialogFormVisible = false;
            this.form.date = ''
            this.form.content = ''
          }
          this.$bus.$emit('handleAlert','新增計畫通知',res.data.message, res.data.type)
        }
        catch(e){}
      },
      openUpdate(obj){
        this.updateIdx = obj.idx;
        this.updateForm.date = obj.date;
        this.updateForm.content = obj.content;
        this.dialogFormVisible2 = true;
      },
      async update(){
        try{
          const res = await axios.put(`/api/studyRecord/update/${this.updateIdx}`,this.updateForm,{
            headers:{
              'x-user-token':jsCookie.get('authToken')
            }
          })
          if(res.data.type == 'success'){
            await this.getData();
            this.updateIdx ='';
            this.updateForm.date = '';
            this.updateForm.content = '';
            this.dialogFormVisible2 = false;
          }
          this.$bus.$emit('handleAlert','變更計畫通知',res.data.message, res.data.type)
        }
        catch(e){}        
      },
      async deleteProject(idx){
        this.$confirm('此操作將永久刪除計畫, 是否繼續?', '提示', {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try{
            const res = await axios.delete(`/api/studyRecord/delete/${idx}`,{
              headers:{
                'x-user-token':jsCookie.get('authToken')
              }
            })
            if(res.data.type == 'success'){
              await this.getData();
            }
            this.$bus.$emit('handleAlert','刪除計畫通知',res.data.message, res.data.type)
          }
            catch(e){}
          })
        .catch(() => {
          return
        });
      }
    }
}
</script>

<style scoped>
  .top{
    width: 100%;
    height: 80px;
    line-height: 80px;
    padding-left: 30px;
    padding-right: 30px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
  .title{
    font-size: 24px;
    font-weight: bolder;
  }
  .statistics{
    width: calc(100% - 60px);
    margin: 0 auto;
    margin-bottom: 30px;
  }
  .add{
    margin-left: auto;
    height: 42px;
  }
  .table{
    width: calc(100% - 45px);
    margin: 0 auto;
  }
  .project_detail {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .create{
    margin-top: 10px;
    width: 100%;
  }
</style>