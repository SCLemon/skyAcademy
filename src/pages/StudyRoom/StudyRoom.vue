<template>
  <div>
    <div class="top">
      <div class="title"><i class="fa-solid fa-book book_icon"></i> 學習紀錄簿</div>
      <el-button class="add" v-if="currentUser && currentUser.typeEng == 'teacher'" @click="dialogFormVisible = true">新增計畫</el-button>
    </div>
    <statistics class="statistics"></statistics>
    <div class="table">
        <div class="clock" v-if="showClock">
          <div class="timer">{{showTime}}</div>
          <div>
            <el-button type="warning" @click="stop(false)">紀錄時間</el-button>
            <el-button type="success" @click="stop(true)">完成計畫</el-button>
          </div>
        </div>
        <el-table :data="tableData" border height="calc(100vh - 505px)" style="width: 100%" class="tableData" empty-text="暫無數據">
          <el-table-column prop="date" label="計畫日期" width="180px"></el-table-column>
          <el-table-column label="學習計畫概要">
            <template v-slot="scope">
                <div class="project_detail">{{scope.row.content}}</div>
            </template>
          </el-table-column>
          <el-table-column label="執行時間統計" width="180px">
            <template v-slot="scope">
                <div >{{ parseInt(scope.row.statistics?.total/60) ?? 0 }} min {{ scope.row.statistics?.total%60 ?? 0 }} sec</div>
            </template>
          </el-table-column>
          <el-table-column label="狀態" width="180px">
            <template v-slot="scope">
                <div><i :class="`fa-solid fa-circle statusIcon ${statusClass(scope.row.status)}`"></i>{{scope.row.status}}</div>
            </template>
          </el-table-column>
          <el-table-column label="其他操作" width="255px">
            <template v-slot="scope">
                <template v-if="currentUser && currentUser.typeEng == 'teacher'">
                  <el-button @click="(scope.row.status == '已完成')?'':start(scope.row.idx)" :disabled="(scope.row.status == '已完成')">執行</el-button>
                  <el-button type="warning" @click="(scope.row.status == '已完成')?'':openUpdate(scope.row)" :disabled="(scope.row.status == '已完成')">修改</el-button>
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
import {differenceInMilliseconds, format} from 'date-fns'
export default {
    name:'StudyRoom',
    components:{
      Statistics
    },
    data(){
      return{
        today:format(new Date(), 'yyyy-MM-dd'),
        currentUser:{},
        beforeUnloadHandler:{},
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
        },

        // 計時
        showClock : false,
        execIdx:'',
        startTime:'',
        stopTime:'',
        showTime:'00:00:00',
        timer:-1,
      }
    },
    mounted(){
      this.getData();
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'))

      // 防呆
      this.beforeUnloadHandler = (event) => {
        if(this.showClock){
          event.preventDefault();
          event.returnValue = '';
        }
      }
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    },
    methods:{

      // CRUD
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
            await this.refreshStatistics();
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
              await this.refreshStatistics();
            }
            this.$bus.$emit('handleAlert','刪除計畫通知',res.data.message, res.data.type)
          }
          catch(e){}
        })
        .catch(() => {
          return
        });
      },

      // ----- 記錄時間 ----- 
      async start(idx){
        this.showClock = true;
        this.execIdx = idx
        this.startTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        this.timer = setInterval(() => {
          let diff = differenceInMilliseconds(new Date(), this.startTime);
          const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
          const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
          const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
          this.showTime = `${hours}:${minutes}:${seconds}`;
        }, 1000);
        await this.startProcessing()
      },
      // 進入點
      async stop(flag){
        clearInterval(this.timer);
        this.stopTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        await this.record(flag);
      },
      // 非直接進入點，入口為 stop()
      async record(flag){
        try{
          const res = await axios.put(`/api/studyRecord/recordTime/${this.execIdx}`,{
            startTime:this.startTime, stopTime: this.stopTime, finish: flag,
          },{
            headers:{
              'x-user-token':jsCookie.get('authToken')
            }
          })
          if(res.data.type == 'success'){
            await this.getData();
            await this.refreshStatistics();
            this.execIdx = '';
            this.startTime = '';
            this.stopTime = '';
            this.showClock = false;
            this.showTime ='00:00:00'
          }
          this.$bus.$emit('handleAlert','計畫紀錄通知',res.data.message, res.data.type)
        }
        catch(e){}
      },

      // 非直接進入點，入口為 start() --> 變更計畫狀態為 進行中
      async startProcessing(){
        try{
          const res = await axios.put(`/api/studyRecord/startProcessing/${this.execIdx}`,{},{
            headers:{
              'x-user-token':jsCookie.get('authToken')
            }
          })
        }
        catch(e){}
      },
      // ----- 記錄時間 -----
      async refreshStatistics(){
        this.$bus.$emit('refreshStudyRecordStatistics')
      },

      // 計算狀態 class
      statusClass(status){
        switch (status){
          case '已完成':
            return 'status-green'
          case '進行中':
            return 'status-yellow'
          default:
            return 'status-default'
        }
      }
    },
    async beforeDestroy(){
      if(this.execIdx){
        await this.stop();
      }
      clearInterval(this.timer)
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
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
  .book_icon{
    margin-right: 5px;
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
    position: relative;
  }
  .clock{
    width: 100%;
    height: calc(100vh - 505px);
    position: absolute;
    top:0;
    left:0;
    box-sizing: border-box;
    background: rgba(255,255,255,0.8);
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .timer{
    width: 100%;
    text-align: center;
    height: 100px;
    line-height: 100px;
    font-size: 52px;
    margin-bottom: 10px;
    font-weight: bolder;
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
  .statusIcon{
    margin-right: 8px;
  }
  .status-green {
    color: lawngreen;
  }

  .status-yellow {
    color: gold;
    animation: flicker 2.5s infinite ease;
  }

  .status-default {
    color: gray;
  }

  @keyframes flicker {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
</style>