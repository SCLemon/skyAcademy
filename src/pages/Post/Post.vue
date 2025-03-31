<!-- 發文帖子 -->
<template>
  <div class="view">
    <div class="posterContainer">
      <div class="posterBox">
        <div class="inputBox">
          <div class="inputTextBox" @click="openDialog('img')">
            <div class="inputTextBoxImg"><img src="img/user.png" alt=""></div>
            <div class="textArea">發表您的貼文</div>
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
              <div class="post_top_img"><img src="img/user.png" alt=""></div>
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
          </div>
        </div>
        <div class="postAll postAll_empty" v-else>
          <el-empty description="暫無貼文"></el-empty>
        </div>
      </div>
      
    </div>
    <div class="column"></div>
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
export default {
  name:'Post',
  data(){
    return {
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
        if(this.$refs.input.innerText.trim()==''){
          this.$refs.input.innerHTML = ''
          if(this.form.attachments.length == 0) this.sendEnabled = false; // 若僅有圖片也可以發送
        }
        else this.sendEnabled = true; // 若僅有文字也可以發送
      }
    })
    await this.getPost()
    await this.getUserInfo()

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
      if(this.form.attachments.length || this.$refs.input.innerHTML.length) this.sendEnabled = true;
      else this.sendEnabled = false;
    },
    handleRemove(file, fileList) {
      this.form.attachments = fileList
      if(this.form.attachments.length || this.$refs.input.innerHTML.length) this.sendEnabled = true;
      else this.sendEnabled = false;
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
    padding-bottom: 15px;
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
    max-height: 100px;
    line-height: 1.5;
    text-align: justify;
    overflow-y:scroll;
  }
  .post_img{
    width: 93%;
    margin: 0 auto;
    margin-top: 10px;
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

</style>