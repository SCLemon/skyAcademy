<!-- 發文帖子 -->
<template>
  <div class="view">
    <div class="posterContainer">
      <div class="posterBox">
        <div class="inputBox">
          <div class="inputTextBox" @click="openDialog('img')">
            <div class="inputTextBoxImg"><img :src="currentUser.userImgUrl?currentUser.userImgUrl:'img/user.png'" alt=""></div>
            <div class="textArea">發表您的貼文和公告</div>
          </div>
          <div class="iconBox">
            <div class="icon_item" @click="openDialog('post')">
              <i class="fa-regular fa-pen-to-square icon"></i> 建立貼文
            </div>
            <div class="icon_item" @click="openDialog('img')">
              <i class="fa-regular fa-images icon"></i> 相片 / 影片
            </div>
          </div>
        </div>
        <div class="postAll" v-if="posts.length">
          <div class="post" v-for="(obj,id) in posts" :key="id">
            <div class="post_more" v-if="showPermission">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  操作<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{ method:'delete', idx: obj.idx}">刪除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div class="post_top">
              <div class="post_top_img"><img :src="obj.creator.userImgUrl?obj.creator.userImgUrl:'img/user.png'" alt=""></div>
              <div class="post_top_detail">
                <div class="post_top_name">{{ obj.creator.name }}</div>
                <div class="post_top_date">{{obj.createTime}}</div>
              </div>
            </div>
            <div class="post_text" v-if="obj.content.trim()!=''" v-html="obj.content"></div>
            <div class="post_img" v-if="obj.postImg.length">
              <el-carousel height="300px" :autoplay="false" :loop="false">
                <el-carousel-item v-for="(item,id) in obj.postImg" :key="id">
                  <div class="carousel_img"><img :src="item.url" alt=""></div>
                </el-carousel-item>
              </el-carousel>
            </div>
            <div class="post_footer">
              <div class="post_option_box">
                <div class="post_option"><i class="fa-regular fa-thumbs-up icon"></i> 按讚</div>
                <div class="post_option"><i class="fa-regular fa-message icon"></i> 留言</div>
              </div>
              <div class="post_viewer_input_box">
                <div class="viewer_inputTextBoxImg"><img :src="currentUser.userImgUrl?currentUser.userImgUrl:'img/user.png'" alt=""></div>
                <textarea class="viewer_textArea" placeholder="在此貼文下進行留言"></textarea>
                <div class="viewer_send"><i class="fa-solid fa-feather"></i></div>
              </div>
            </div>
          </div>
        </div>
        <div class="postAll postAll_empty" v-else>
          <el-empty description="暫無貼文"></el-empty>
        </div>
      </div>
      
    </div>
    <div class="column">
      <div class="daily">
        <el-card shadow="hover" class="daily_card">
          <div slot="header"><span>每日練習</span><el-button style="float: right; padding: 3px 0" type="text" @click="getDailyQuestion()">隨機出題</el-button></div>
          <div class="daily_content_all">
            <div class="daily_content">
              <div class="daily_question">{{dailyQuestion.question.question}}</div>
              <div class="daily_options">{{dailyQuestion.question.options}}</div>
            </div>
            <div class="statistic">
              <div class="statistic_title">距離 {{ dailyQuestion.title }}：</div>
              <div class="statistic_num">{{ remainDay }}</div>
              <div class="daily_answer">{{dailyQuestion.question.answer}}</div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="todayCourse">
        <div class="todayCourseTitle">今日課表</div>
        <el-table :data="todayCourse" height="282px" border style="width: 90%" empty-text="今日無課程">
          <el-table-column prop="startTime" label="上課時間"></el-table-column>
          <el-table-column prop="courseId" label="課程代碼"></el-table-column>
          <el-table-column prop="courseName" label="課程名稱"></el-table-column>
          <el-table-column prop="lecturer" label="授課教師"></el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog title="建立貼文" :visible.sync="dialogTableVisible" v-if="showPermission">
      <div class="real_input" ref="input" contenteditable="true"></div>
      <el-upload action="#" :auto-upload="false" list-type="picture-card" :on-change="handleUpload" :on-preview="handlePictureCardPreview" :on-remove="handleRemove" :file-list="form.attachments" :multiple="true" accept="image/*"><i class="el-icon-plus"></i></el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
      <el-button type="primary" class="button" @click="create()" :loading="isSending" >建立貼文</el-button>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import jsCookie from 'js-cookie'
import { format, differenceInDays } from 'date-fns';
export default {
  name:'Post',
  data(){
    return {
      currentUser:{},
      // 每日練習
      dailyQuestion:{
        title:'',
        deadline:'',
        question:{}
      },
      remainDay:0,
      // 今日課程
      todayCourse:[],
      // 上傳內容
      form:{
        content:'',
        attachments:[]
      },
      isSending:false,
      showPlaceholder:true,
      // 貼文創建
      dialogTableVisible:false,
      sendEnabled: false,
      inputKeyUpfunction:{},
      // 圖片牆
      dialogImageUrl: '',
      dialogVisible: false,

      // 顯示貼文
      posts:[],
      showPermission:false,
      timer:-1, // 自動汲取貼文
      
    }
  },
  async mounted(){
    this.inputKeyUpfunction = window.addEventListener('keyup',()=>{
      if(this.dialogTableVisible && this.$refs.input){
        if(this.$refs.input.innerText.trim()=='' && this.$refs.input.innerHTML.length == 4) this.$refs.input.innerHTML = ''
      }
    })
    await this.getPost()
    await this.getUserInfo()
    await this.getDailyQuestion()
    await this.getTodayCourse();
    this.currentUser = this.$bus.$currentUser

    this.timer = setInterval(() => {
      this.getPost();
    }, 15000);
  },

  methods:{
    handleCommand(payload){
      if(payload.method == 'delete'){
        this.deletePost(payload.idx)
      }
    },
    async getDailyQuestion(){
      const res = await axios.get('/api/post/getDailyQuestion',{
          headers:{
              'x-user-token':jsCookie.get('authToken'),
          }
      })
      if(res.data.type == 'success'){
        this.remainDay = differenceInDays(new Date(res.data.data.deadline), Date.now());
        this.dailyQuestion = res.data.data
      }
      else this.$bus.$emit('handleAlert','獲取每日一題通知',res.data.message,res.data.type)
    },
    async getTodayCourse(){
      const res = await axios.get('/api/post/getTodayCourse',{
          headers:{
              'x-user-token':jsCookie.get('authToken'),
          }
      })
      if(res.data.type == 'success'){
        this.todayCourse = res.data.courses;
        console.log(this.todayCourse)
      }
      else this.$bus.$emit('handleAlert','獲取今日課程通知',res.data.message,res.data.type)
    },
    async getUserInfo(){
      const token = jsCookie.get('authToken');
      if(!token) return 
      try{
        const res = await axios.post('/login/token',{save:false},{
          headers:{
            'x-user-token':token
          }
        })
        if(res.data.type == 'success'){
          this.showPermission = (res.data.userInfo.typeEng == 'teacher')
        }
      }
      catch(e){}
    },
    async getPost(){
      const res = await axios.get('/api/post/getPost',{
          headers:{
              'x-user-token':jsCookie.get('authToken'),
          }
      })
      if(res.data.type == 'success'){
        this.posts = res.data.posts.reverse()
      }
      else this.$bus.$emit('handleAlert','貼文創建通知',res.data.message,res.data.type)
    },
    async create(){
      this.isSending = true;
      this.form.content = this.$refs.input.innerHTML;
      const formData = new FormData();
      formData.append('content', this.form.content);

      if (this.form.attachments && this.form.attachments.length > 0) {
          this.form.attachments.forEach((file, index) => {
              formData.append('attachments', file.raw);
          });
      }
      const res = await axios.post('/api/post/create',formData,{
          headers:{
              'x-user-token':jsCookie.get('authToken'),
          }
      })
      if(res.data.type == 'success'){
          this.getPost()
          this.dialogTableVisible = false;
          this.form = {
              content:'',
              attachments:[]
          },
          this.$refs.input.innerHTML = '';
          this.$bus.$emit('handleAlert','貼文創建通知',res.data.message,res.data.type)
      }
      else this.$bus.$emit('handleAlert','貼文創建通知',res.data.message,res.data.type)
      this.isSending = false;
    },
    async deletePost(idx){
      try{
        await this.$confirm(`確認是否刪除貼文?`, '提示', {
          confirmButtonText: '刪除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const res = await axios.delete(`/api/post/deletePost/${idx}`,{
          headers:{
            'x-user-token':jsCookie.get('authToken')
          }
        })
        if(res.data.type == 'success'){
          this.getPost();
          this.$bus.$emit('handleAlert','貼文刪除通知',res.data.message,res.data.type)
        }
        else this.$bus.$emit('handleAlert','貼文刪除通知',res.data.message,res.data.type)
      }
      catch(e){}
    },
    openDialog(){
      if(this.showPermission) this.dialogTableVisible = true;
      else this.$bus.$emit('handleAlert','創建貼文權限通知','目前平台並未開放學生進行貼文','warning')
    },

    // 圖片處理
    handleUpload(file,fileList){
      this.form.attachments = fileList
    },
    handleRemove(file, fileList) {
      this.form.attachments = fileList
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    }
  },
  beforeDestroy(){
    window.removeEventListener('keyup',this.inputKeyUpfunction);
    clearInterval(this.timer)
  }
}
</script>

<style scoped>
  .view{
    width: calc(100vw - 250px);
    height: 100vh;
    display: flex;
    justify-content: space-evenly;
  }
  .posterContainer{
    width: 700px;
    height: 100vh;
  }
  .inputBox{
    width: 100%;
    height: auto;
    min-height: 120px;
    box-shadow: 0px 1px 3px gray;
    border-radius: 5px;
    display: flex;
    margin-left: 5px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .inputTextBox{
    width: 95%;
    height: 60px;
    margin: 0 auto;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .inputTextBoxImg{
    width: 40px;
    height: 40px;
    border-radius: 40px;
    overflow: hidden;
  }
  .inputTextBoxImg>img{
    width: 100%;
  }
  .textArea {
    width: 520px;
    height: 40px;
    line-height: 40px;
    overflow-y: auto;
    padding-left: 20px;
    font-size: 14px;
    border-radius: 20px;
    border: none;
    outline: none;
    background-color: #F0F2F5;
    box-sizing: border-box;
    color: gray;
  }
  .textArea:hover{
    cursor: pointer;
    background-color:rgb(240,240,240);
  }
  .iconBox{
    width: 95%;
    height: 60px;
    margin: 0 auto;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .icon_item{
    width: 50%;
    height: 55px;
    line-height: 55px;
    text-align: center;
    border-radius: 5px;
  }
  .icon_item:hover{
    cursor: pointer;
    background-color: rgba(240,240,240);
  }
  .icon{
    margin-right: 5px;
  }
  .column{
    width: 490px;
    height: 100vh;
  }
  .posterBox{
    width: 600px;
    margin: 0 auto;
    margin-top: 20px;
    height: 100vh;
  }
  ::v-deep .el-dialog{
    width: 720px;
  }
  .real_input{
    width: 100%;
    height: auto;
    min-height: 100px;
    max-height: 200px;
    overflow-y: scroll;
    line-height: 1.5;
    margin: 0 auto;
    margin-top: -15px;
    margin-bottom: 20px;
    box-sizing: border-box;
    position: relative;
  }
  .real_input:focus{
    outline: none;
  }
  .real_input:empty::before {
    content: "請輸入您要發表的貼文內容";
    color: #aaa;
    position: absolute;
    top: 0px;
    left: 0px;
    font-size: 16px;
    pointer-events: none;
  }
  .button{
    margin-top: 30px;
    margin-bottom: -10px;
    width: 100%;
  }
  .postAll{
    width: 620px;
    height: calc(100vh - 160px);
    overflow-y:scroll;
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 10px;
    margin-top: 15px;
  }
  .postAll_empty{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .post{
    width: 600px;
    height: auto;
    box-shadow: 0px 1px 3px gray;
    border-radius: 5px;
    position: relative;
    margin-bottom: 15px;
  }
  .post_more{
    position: absolute;
    top: 10px;
    right: 10px;
  }
  .post_top{
    width: 95%;
    height: 55px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .post_top_img{
    width: 40px;
    height: 40px;
    border-radius: 40px;
    overflow: hidden;
  }
  .post_top_img>img{
    width: 100%;
    display: inline-block;
  }
  .post_top_detail{
    width: 520px;
    height: 40px;
    line-height: 20px;
  }
  .post_top_name{
    width: 100%;
    font-size: 16px;
    overflow-y: scroll;
  }
  .post_top_date{
    width: 100%;
    font-size: 10px;
  }
  .post_text{
    width: 93%;
    margin: 0 auto;
    margin-top: 5px;
    margin-bottom: 10px;
    max-height: 100px;
    line-height: 1.5;
    text-align: justify;
    overflow-y:scroll;
  }
  .post_img{
    width: 93%;
    margin: 0 auto;
    height: 300px;
  }
  .carousel_img{
    width: 100%;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .carousel_img>img{
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  ::v-deep .el-carousel__indicator{
    display: none;
  }
  ::v-deep .el-upload-list__item img {
    width: 100%;   
    height: 100%;  
    object-fit: cover; 
  }
  .post_footer{
    width: 95%;
    height: 95px;
    margin: 0 auto;
  }
  .post_option_box{
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-evenly;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  .post_option{
    text-align: center;
    height: 40px;
    line-height: 40px;
    width: 50%;
    border-radius: 5px;
  }
  .post_option:hover{
    cursor: pointer;
    background-color: rgba(240,240,240);
  }
  .post_viewer_input_box{
    width: 100%;
    height: 55px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .viewer_inputTextBoxImg{
    width: 35px;
    height: 35px;
    border-radius: 35px;
    overflow: hidden;
  }
  .viewer_inputTextBoxImg>img{
    width: 100%;
  }
  .viewer_textArea {
    width: 470px;
    height: 35px;
    padding-top: 9px;
    line-height: 17.5px;
    overflow-y: auto;
    padding-left: 20px;
    margin-left: 10px;
    font-size: 14px;
    border-radius: 20px;
    border: none;
    outline: none;
    background-color: #F0F2F5;
    box-sizing: border-box;
    color: gray;
    resize: none;
  }
  .viewer_textArea:hover{
    cursor: pointer;
    background-color:rgb(240,240,240);
  }
  .viewer_send{
    text-align: center;
    width: 35px;
    height: 35px;
    line-height: 35px;
    font-size: 18px;
    border-radius: 5px;
  }
  .viewer_send:hover{
    cursor: pointer;
    background-color:rgb(240,240,240);
  }
  .column{
    width: calc(100% -700px);
    height: 100vh;
  }
  .daily{
    margin-top: 20px;
    width: 100%;
    margin-bottom: 30px;
  }
  
  .daily_card{
    width: 90%;
  }
  ::v-deep .el-card__body{
    min-height: 226px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .daily_content_all{
    position: relative;
  }
  .daily_content_all:hover .daily_answer{
    opacity: 1;
  }
  .daily_content{
    line-height: 1.5;
    width: 100%;
    max-height: 200px;
    text-align: left;
    overflow-y: scroll;
    margin-bottom: 35px;
  }
  .daily_question{
    width: 100%;
    margin-bottom: 10px;
    font-size: 16px;
  }
  .daily_options{
    font-size: 16px;
  }
  .statistic{
    width: 100%;
    text-align: center;
    line-height: 1.5;
    position: relative;
  }
  .statistic_title{
    font-size: 12px;
    color: gray;
  }
  .daily_answer{
    position: absolute;
    bottom: 0px;
    right: 25px;
    font-size: 32px;
    opacity: 0;
    color: red;
    transition: opacity 1s;
  }
  .todayCourseTitle{
    height: 53px;
    line-height: 53px;
    font-size: 16px;
    padding-left: 18px;
    border: 1px solid #EBEEF5;
    border-bottom: 0;
    border-radius: 4px 4px 0 0;
    width: 90%;
    box-sizing: border-box;
  }
  ::v-deep .el-table{
    border-radius: 0 0 4px 4px;
  }
</style>