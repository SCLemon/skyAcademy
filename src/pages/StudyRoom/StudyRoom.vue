<template>
  <div class="view">
    <div class="top">
      <div class="title"><i class="fa-solid fa-book book_icon"></i> 學習紀錄簿 <i class="el-icon-warning-outline alert" @click="showAlert()"></i> </div>
      <input type="file" ref="importFile" class="importFile" @change="importRecord($event)" accept=".json">
      <el-button class="add" v-if="currentUser && currentUser.typeEng == 'teacher' && !showClock" @click="handleImport()">匯入紀錄</el-button>
      <el-button class="add" v-if="currentUser && currentUser.typeEng == 'teacher' && !showClock" @click="dialogFormVisible = true">新增計畫</el-button>
    </div>
    <div class="showRegion">
      <statistics class="statistics"></statistics>
      <paper-read class="paperRead"></paper-read>
    </div>
    <div class="table">
        <div class="clock" v-if="currentUser && currentUser.typeEng == 'teacher' && showClock">
          <div class="timer">{{showTime}}</div>
          <div>
            <el-button type="warning" @click="stop(false)">紀錄時間</el-button>
            <el-button type="success" @click="stop(true)">完成計畫</el-button>
          </div>
        </div>
        <el-table :data="tableData" border height="calc(100vh - 505px)" empty-text="暫無數據">
          <el-table-column prop="date" label="計畫日期" width="140px" ></el-table-column>
          <el-table-column label="學習計畫概要">
            <template v-slot="scope">
                <div class="project_detail">{{scope.row.content}}</div>
            </template>
          </el-table-column>
          <el-table-column label="預計完成時間" width="140px">
            <template v-slot="scope">
                <div @click="showRecord(scope.row)">{{ scope.row.expectTime ?? 0 }} min</div>
            </template>
          </el-table-column>
          <el-table-column label="執行時間統計" width="140px">
            <template v-slot="scope">
                <div @click="showRecord(scope.row)">{{ parseInt(scope.row.statistics?.total/60) ?? 0 }} min {{ scope.row.statistics?.total%60 ?? 0 }} sec</div>
            </template>
          </el-table-column>
          <el-table-column label="狀態" width="140px">
            <template v-slot="scope">
                <div><i :class="`fa-solid fa-circle statusIcon ${statusClass(scope.row.status)}`"></i>{{scope.row.status}}</div>
            </template>
          </el-table-column>
          <el-table-column label="其他操作" width="255px">
            <template v-slot="scope">
                <template v-if="currentUser && currentUser.typeEng == 'teacher'">
                  <el-button @click="(scope.row.status != '尚未完成' && scope.row.status != '進行中')?'':startProcessing(scope.row.idx)" :disabled="(scope.row.status != '尚未完成' && scope.row.status != '進行中')">執行</el-button>
                  <el-button type="warning" @click="(scope.row.status == '進行中')?'':openUpdate(scope.row)" :disabled="(scope.row.status == '進行中')">修改</el-button>
                  <el-button type="danger" @click="deleteProject(scope.row.idx)">刪除</el-button>
                </template>
                <template v-else>無權限進行操作</template>
            </template>
          </el-table-column>
        </el-table>
    </div>
    <el-dialog title="新增計畫" :visible.sync="dialogFormVisible" custom-class="PWACSS_MessageBox">
      <el-form :model="form">
        <el-form-item label="計畫日期：">
          <el-date-picker v-model="form.date" align="right" type="date" placeholder="選擇日期" :picker-options="pickerOptions"></el-date-picker>
        </el-form-item>
        <el-form-item label="學習計畫概要">
          <el-input v-model="form.content" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="預計所需時間 (分鐘)：">
          <el-input-number v-model="form.expectTime" :min="15"></el-input-number>
        </el-form-item>
        <el-form-item label="計畫類別：">
          <el-select v-model="form.projectType" placeholder="請選擇類別">
            <el-option v-for="item in projectTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" class="create" :disabled="(form.content.trim() =='')" @click="(form.content.trim()=='')?'':create()">新增計畫</el-button>
    </el-dialog>
    <el-dialog title="修改計畫" :visible.sync="dialogFormVisible2" custom-class="PWACSS_MessageBox">
      <el-form :model="form">
        <el-form-item label="計畫日期">
          <el-date-picker v-model="updateForm.date" align="right" type="date" placeholder="選擇日期" :picker-options="pickerOptions2"></el-date-picker>
        </el-form-item>
        <el-form-item label="學習計畫概要">
          <el-input v-model="updateForm.content" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="計畫類別：">
          <el-select v-model="updateForm.projectType" placeholder="請選擇類別">
            <el-option v-for="item in projectTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" class="create" :disabled="(!updateForm.date ||updateForm.content.trim()=='')" @click="(!updateForm.date ||updateForm.content.trim()=='')?'':update()">修改計畫</el-button>
    </el-dialog>
    <el-dialog title="計畫執行紀錄" :visible.sync="dialogFormVisible3" custom-class="PWACSS_MessageBox">
      <el-table :data="showRecordData" stripe height="auto" style="width: 100%; max-height: 400px; overflow-y: scroll;" :empty-text="'暫無數據'">
        <el-table-column prop="idx" label="輪次" width="50px"></el-table-column>
        <el-table-column prop="start" label="起始時間"></el-table-column>
        <el-table-column prop="end" label="截止時間"></el-table-column>
        <el-table-column prop="diff" label="持續時間"></el-table-column>
      </el-table>
      <div class="export_button_wrapper" v-if="currentUser && currentUser.typeEng == 'teacher'"><el-button class="export_button" @click="exportRecord(showRecordIdx)">匯出紀錄</el-button></div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import Statistics from './components/Statistics.vue';
import PaperRead from './components/PaperRead.vue';
import jsCookie from 'js-cookie';
import {differenceInMilliseconds, format} from 'date-fns'
export default {
    name:'StudyRoom',
    components:{
      Statistics, PaperRead
    },
    data(){
      return{
        today:format(new Date(), 'yyyy-MM-dd'),
        currentUser:{},
        beforeUnloadHandler:{},
        tableData:[],
        projectTypeOptions:[
          {label:'學術研究',value:'學術研究'},
          {label:'課外學習',value:'課外學習'},
          {label:'休閒娛樂',value:'休閒娛樂'},
          {label:'運動健身',value:'運動健身'},
          {label:'其他',value:'其他'},
        ],

        // 新增
        dialogFormVisible:false,
        form:{
          date: new Date(),
          content:'',
          expectTime: 90,
          projectType:''
        },
        pickerOptions: {
          disabledDate(time) {
            let today = new Date();
            today.setHours(0, 0, 0, 0);
            return time.getTime() < today.getTime();
          },
        },
        
        // 修改
        dialogFormVisible2:false,
        updateIdx:'',
        updateForm:{
          date:'',
          content:'',
          projectType:'',
        },
        pickerOptions2: {
          disabledDate: () => {} 
        },
        
        // 計時
        executing: {},
        showClock : false,
        stopTime:'',
        showTime:'00:00:00',
        timer:-1,

        // 顯示執行紀錄
        dialogFormVisible3:false,
        showRecordData:[],
        showRecordIdx:'',
        
        resizeTimer: null,
      }
    },
    mounted(){
      this.getData();
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
      this.pickerOptions2.disabledDate = this.disabledDate2;
      window.addEventListener('resize', this.handleResize);
    },
    methods:{
      handleResize(){
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(async () => {
          this.refreshStatistics();
        }, 500);
      },
      // 顯示 Question
      showAlert(){
       try{
          const str = `本學習記錄簿旨在系統性整理與記錄本學期之修課學習歷程。惟實驗操作與論文閱讀屬於高度動態且需反覆修正之學習活動，較難即時完整紀錄，故本記錄簿主要聚焦於修課相關之學習內容與理解歷程。`
          this.$alert(str, '學習記錄簿介紹', {
            confirmButtonText: '確定',
            callback: ()=>{},
            customClass:'PWACSS_MessageBox'
          });
          this.$nextTick(()=>{
            document.querySelector('.el-message-box').style = 'text-align: justify !important;';
          })
       }
       catch(e){}
      },
      // 修改過程 - 時間
      disabledDate2(time) {
        let limit = new Date(this.updateForm.date);
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        limit.setHours(0, 0, 0, 0);

        // 取 today or limit 最小者為邊界
        if(today.getTime() < limit.getTime()){
          return time.getTime() < today.getTime()
        }
        return time.getTime() < limit.getTime();
      },

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

            // 延續前次紀錄
            const executing = res.data.executing;
            if(executing){
              this.executing = executing;
              this.start()
            }
            
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
            this.form.date = new Date();
            this.form.content = ''
            this.form.expectTime = 90;
            this.form.projectType = '';
          }
          this.$bus.$emit('handleAlert','新增計畫通知',res.data.message, res.data.type)
        }
        catch(e){}
      },
      openUpdate(obj){
        this.updateIdx = obj.idx;
        this.updateForm.date = new Date(obj.date);
        this.updateForm.content = obj.content;
        this.updateForm.projectType = obj.projectType;
        this.dialogFormVisible2 = true;
      },
      async update(){
        try{
          const res = await axios.put(`/api/studyRecord/update/${this.updateIdx}`,this.updateForm,{
            headers:{
              'x-user-token':jsCookie.get('authToken')
            }
          })
          
          await this.getData();
          await this.refreshStatistics();
          this.updateIdx ='';
          this.updateForm.date = '';
          this.updateForm.content = '';
          this.updateForm.projectType = '';
          this.dialogFormVisible2 = false;
          
          this.$bus.$emit('handleAlert','變更計畫通知',res.data.message, res.data.type)
        }
        catch(e){}        
      },
      async deleteProject(idx){
        this.$confirm('此操作將永久刪除計畫, 是否繼續?', '提示', {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass:'PWACSS_MessageBox'
        }).then(async () => {
          try{
            const res = await axios.delete(`/api/studyRecord/delete/${idx}`,{
              headers:{
                'x-user-token':jsCookie.get('authToken')
              }
            })
            this.$bus.$emit('handleAlert','刪除計畫通知',res.data.message, res.data.type)
          }
          catch(e){}
          finally{
            await this.getData();
            await this.refreshStatistics();
          }
        })
        .catch(() => {
          return
        });
      },

      // ----- 記錄時間 ----- 
      async startProcessing(idx){
        try{
          const res = await axios.put(`/api/studyRecord/startProcessing/${idx}`,{},{
            headers:{
              'x-user-token':jsCookie.get('authToken')
            }
          })
          await this.getData();
          this.$bus.$emit('執行計畫通知', res.data.message, res.data.type)
        }
        catch(e){}
      },
      async start(){ // <-- 從 getData() 進入
        this.showClock = true;
        const startTime = format(this.executing.startTime, 'yyyy-MM-dd HH:mm:ss')
        this.timer = setInterval(() => {
          let diff = differenceInMilliseconds(new Date(), startTime);
          const hours = String(Math.floor(diff / (1000 * 60 * 60)) || 0).padStart(2, '0');
          const minutes = String(Math.floor((diff / (1000 * 60)) % 60) || 0).padStart(2, '0');
          const seconds = String(Math.floor((diff / 1000) % 60) || 0).padStart(2, '0');
          this.showTime = `${hours}:${minutes}:${seconds}`;
        }, 200);
        this.$bus.$emit('handleAlert','計畫執行通知','計畫執行開始。', 'success');
      },

      async stop(flag){
        clearInterval(this.timer);
        this.stopTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        await this.record(flag);
      },
      // 非直接進入點，入口為 stop()
      async record(flag){
        try{
          const res = await axios.put(`/api/studyRecord/recordTime/${this.executing.idx}/${this.executing.taskId}`,{
            stopTime: this.stopTime, finish: flag,
          },{
            headers:{
              'x-user-token':jsCookie.get('authToken')
            }
          })
          if(res.data.type != 'error'){
            await this.getData();
            await this.refreshStatistics();
            this.executing = {};
            this.stopTime = '';
            this.showClock = false;
            this.showTime ='00:00:00'
          }
          this.$bus.$emit('handleAlert','計畫紀錄通知',res.data.message, res.data.type)
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
          case '提前完成':
            return 'status-green'
          case '延遲完成':
            return 'status-red'
          case '進行中':
            return 'status-yellow'
          default:
            return 'status-default'
        }
      },

      // 查看執行紀錄
      showRecord(obj){
        this.dialogFormVisible3 = true;
        const records = obj?.statistics?.record ?? [];
        this.showRecordData = records.map((item,idx)=>{
          return {
            idx: idx+1,
            start: item.start,
            end: item.end,
            diff : `${(differenceInMilliseconds(item.end, item.start)/1000/60).toFixed(1)} min`
          }
        })
        this.showRecordIdx = obj.idx;
      },
      // 匯出單筆紀錄
      async exportRecord(idx){
        try{
          const res = await axios.get(`/api/studyRecord/export/${idx}`,{
            headers:{
              'x-user-token':jsCookie.get('authToken')
            },
            responseType: 'blob'
          })
          const contentDisposition = res.headers['content-disposition'];
          let filename = 'record.json';
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) filename = match[1];
          }

          // 建立 blob 物件並觸發下載
          const blob = new Blob([res.data], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          this.$bus.$emit('handleAlert', '計畫紀錄通知', '匯出成功！', 'success');
        }
        catch(e){
          console.error(e);
          this.$bus.$emit('handleAlert', '計畫紀錄通知', '匯出失敗或伺服器錯誤', 'error');
        }
      },
      // 匯入單筆紀錄
      handleImport(){
        this.$refs['importFile'].click();
      },
      async importRecord(e){
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await axios.post('/api/studyRecord/import', formData, {
            headers: {
              'x-user-token': jsCookie.get('authToken'),
              'Content-Type': 'multipart/form-data'
            }
          });
          if(res.data.type == 'success'){
            await this.getData();
            await this.refreshStatistics();
          }
          this.$bus.$emit('handleAlert', '計畫紀錄通知', res.data.message, res.data.type);
        } 
        catch (err) {
          this.$bus.$emit('handleAlert', '計畫紀錄通知', '匯入失敗或伺服器錯誤', 'error');
        }
        finally{
          e.target.value = '';
        }
      }
    },
    async beforeDestroy(){
      clearInterval(this.timer)
      window.removeEventListener('resize', this.handleResize);
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
  .alert{
    font-size:16px;
  }
  .alert:hover{
    cursor: pointer;
  }
  .showRegion{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc(100% - 60px);
    margin: 0 auto;
    margin-bottom: 30px;
    box-sizing: border-box;
  }
  .statistics{
    width: 70%;
    margin-right: 35px;
  }
  .paperRead{
    width: 30%;
  }
  .export_button_wrapper{
    margin-top: 15px;
    display: flex;
    align-items: center;
  }
  .export_button{
    margin-left: auto;
  }
  .add{
    margin-left: auto;
    height: 42px;
  }
  .importFile{
    display: none;
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
  .status-red {
    color: lightcoral;
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
  :deep(.el-table){
    height: calc(100vh - 505px);
    width: 100%;
  }
  :deep(.el-table__row){
    height: 65px !important;
  }
  @media screen and (max-width: 440px) {
    .view{
      width: 95vw;
      margin: 0 auto;
      margin-top: 20px;
    }
    .top{
      padding-left: 5px;
      padding-right: 5px;
      height: 50px;
      line-height: 50px;
      width: 100%;
      margin: 0 auto;
      margin-bottom: 20px;
      box-sizing: border-box;
    }
    .title{
      font-size: 18px;
      font-weight: bolder;
    }
    .showRegion{
      width:100%;
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    .statistics{
      width: 100%;
      margin-right: 0;
      scroll-snap-align: center;
    }
    .paperRead{
      width: 100%;
      box-shadow: none;
      scroll-snap-align: start;
    }
    .table{
      width: 100%;
    }
    :deep(.el-table){
        width: 100%;
        height: calc(100vh - 565px) !important;
    }
  }
</style>