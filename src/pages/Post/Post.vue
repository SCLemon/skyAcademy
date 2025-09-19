<!-- 發文帖子 -->
<template>
  <div class="view">
    <div class="posterContainer">
      <div class="posterBox">
        <div class="inputBox" v-if="currentUser.typeEng == 'teacher'">
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
        <div :class="`postAll ${currentUser.typeEng=='teacher'?'':'postAll_student'}`" ref="postAll" @scroll="postDivScroll()" v-if="posts.length">
          <div class="post" v-for="(obj,id) in posts" :key="id">
            <div class="post_more" v-if="showPermission">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  操作<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{ method:'modify',content: obj.content, idx: obj.idx}">編輯</el-dropdown-item>
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
              <div class="post_text_expand_logo" v-if="obj.content.trim()!=''" @click="expandPostText($event)"><i class="fa-solid fa-expand"></i></div>
            </div>
            <div class="post_text" v-if="obj.content.trim()!=''" v-html="obj.content"></div>
            <div class="post_img" v-if="obj.postImg.length">
              <el-carousel :autoplay="false" :loop="false">
                <el-carousel-item v-for="(item,id) in obj.postImg" :key="id">
                  <div class="carousel_img"><img src="img/Loading.gif" :data-src="item.url" v-lazy alt=""></div>
                </el-carousel-item>
              </el-carousel>
            </div>
            <div class="post_footer">
              <div class="post_summary" v-if="obj.likeCount || obj.message.length">
                <div class="post_summary_thumb" v-if="obj.likeCount || obj.isLike">
                  <i class="fa-solid fa-thumbs-up post_summary_thumb_icon"></i>
                  <span v-if="obj.isLike && obj.likeCount != 1">你和其他 {{obj.likeCount - 1}} 人</span>
                  <span v-else-if="obj.isLike">你</span>
                  <span v-else>{{obj.likeCount}}</span>
                </div>
                <div class="post_summary_msg" v-if="obj.message.length">{{obj.message.length}} <i class="fa-solid fa-message post_summary_msg_icon"></i></div>
              </div>
              <div class="post_option_box">
                <div :class="`post_option ${obj.isLike?'like':''}`" @click="toggleLikePost(obj.idx, $event, obj)"><i :class="`fa-regular fa-thumbs-up icon ${obj.isLike?'fa-solid':''}`"></i> <span>{{ obj.isLike?'收回讚':'按讚' }}</span></div>
                <div class="post_option" @click="openUserMessageBox($event)"><i class="fa-regular fa-message icon"></i> 留言</div>
                <div class="post_option"><i class="fa-regular fa-share-from-square icon"></i> 分享</div>
              </div>
              <div class="userMessageBox">
                <div class="userMessage" style="text-align: center; color:gray; font-size: 14px;" v-if="!obj.message.length">目前暫時沒有人留言</div>
                <div class="userMessage_active" v-for="(item,id) in obj.message" :key="id">
                  <img class="userMessage_active_img" src="img/user.png" :data-src="item.userImgUrl" v-lazy alt="" loading="lazy">
                  <div class="userMessage_active_msgBox">
                    <div class="userMessage_active_name">{{ item.name }} <span class="userMessage_active_createTime">{{ item.createTime }}</span></div>
                    <div class="userMessage_active_msg">{{ item.message }}</div>
                  </div>
                </div>
                <div class="post_viewer_input_box">
                  <img class="viewer_inputTextBoxImg" :src="currentUser.userImgUrl?currentUser.userImgUrl:'img/user.png'" alt="">
                  <textarea class="viewer_textArea" placeholder="在此貼文下進行留言"></textarea>
                  <div class="viewer_send" @click="sendUserMessage(obj.idx, $event)"><i class="fa-solid fa-feather"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="postAll postAll_empty" v-else>
          <el-empty description="暫無貼文"></el-empty>
        </div>
      </div>
      <div class="column">
        <self-intro></self-intro>
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
    <el-dialog title="修改貼文" :visible.sync="dialogTableVisible2" v-if="showPermission">
      <div class="real_input" ref="modifyContent" contenteditable="true"></div>
      <el-button type="primary" class="button" @click="modifyPost()" :loading="isSending" >修改貼文</el-button>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import jsCookie from 'js-cookie'
import selfIntro from './components/selfIntro.vue'
export default {
  name:'Post',
  components:{
    selfIntro
  },
  data(){
    return {
      currentUser:{},
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
      page:1,
      showPermission:false,
      isLoadingMore: false, // 加載狀態，避免重複請求

      // 修改貼文內容
      modifyIdx:'',
      modifyContent:'',
      dialogTableVisible2:false,
      
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
    this.currentUser = this.$bus.$currentUser

  },

  methods:{
    handleCommand(payload){
      if(payload.method == 'delete'){
        this.deletePost(payload.idx)
      }
      if(payload.method == 'modify'){
        this.openModifyBox(payload.content,payload.idx)
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

    postDivScroll(){
      const postAllDiv = this.$refs.postAll;
      if (postAllDiv.scrollHeight - postAllDiv.scrollTop === postAllDiv.clientHeight) {
        this.getPost();
      }
    },
    async getPost(flag){
      if (this.isLoading) return;
      this.isLoading = true;
      if(flag == 'refresh'){
        this.posts = [];
        this.page = 1;
      }
      try{
        const res = await axios.get(`/api/post/getPost?page=${this.page}`,{
          headers:{
              'x-user-token':jsCookie.get('authToken'),
          }
        })
        if(res.data.type == 'success'){
          const newPosts = res.data.posts;
          this.posts = this.posts.concat(newPosts);
          this.page++;

          this.$nextTick(async() => {
            const postAllDiv = this.$refs.postAll;
            // 如果內容高度仍然 <= 容器高度，代表還不夠滾動，繼續載入
            if (postAllDiv && postAllDiv.scrollHeight <= postAllDiv.clientHeight && newPosts.length > 0) {
              await this.getPost();
            }
          });
        }
        else this.$bus.$emit('handleAlert','貼文創建通知',res.data.message,res.data.type)
      }
      catch(e){}
      finally{
        this.isLoading = false;
      }
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
          this.getPost('refresh')
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
          this.getPost('refresh');
          this.$bus.$emit('handleAlert','貼文刪除通知',res.data.message,res.data.type)
        }
        else this.$bus.$emit('handleAlert','貼文刪除通知',res.data.message,res.data.type)
      }
      catch(e){}
    },
    async openModifyBox(content, idx){
      this.dialogTableVisible2 = true;
      this.$nextTick(()=>{
        this.$refs['modifyContent'].innerHTML = content;
      })
      this.modifyIdx = idx;
    },
    async modifyPost(){
      try{
        this.modifyContent =  this.$refs['modifyContent'].innerHTML;
        const res = await axios.post(`/api/post/modifyPost/${this.modifyIdx}`,{content:this.modifyContent},{
          headers:{
            'x-user-token':jsCookie.get('authToken')
          }
        })
        if(res.data.type == 'success'){
          this.getPost('refresh');
          this.dialogTableVisible2 = false;
          this.modifyContent = '';
          this.modifyIdx = '';
          this.$bus.$emit('handleAlert','貼文修改通知',res.data.message,res.data.type)
        }
        else this.$bus.$emit('handleAlert','貼文修改通知',res.data.message,res.data.type)
      }
      catch(e){}
    },
    async toggleLikePost(idx,event,obj){
      const wrapper = event.currentTarget; 
      const icon = wrapper.querySelector('i');
      const span = wrapper.querySelector('span')
      try{
        const res = await axios.get(`/api/post/toggleLikePost/${idx}`,{
          headers:{
            'x-user-token':jsCookie.get('authToken')
          }
        })
        if(res.data.type == 'success'){
          wrapper.classList.toggle('like')
          icon.classList.toggle('fa-solid')
          span.innerText == '按讚'? span.innerText='收回讚':span.innerText='按讚'
          obj.likeCount = res.data.likeCount;
          obj.isLike ? obj.isLike = false : obj.isLike = true;
        }
        else this.$bus.$emit('handleAlert','貼文按讚通知',res.data.message,res.data.type)
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
    },

    // 留言區
    msgScrollToBottom(event){
      this.$nextTick(() => {
        const box = event.target.closest('.userMessageBox')  // 找到留言框
        if (box) {
          box.scrollTop = box.scrollHeight
        }
      })
    },
    openUserMessageBox(event){
      const postOption = event.currentTarget;
      const icon = postOption.querySelector('i')
      icon.classList.toggle('fa-solid');
      const userMessageBox = postOption.closest('.post_option_box').nextElementSibling;
      userMessageBox.classList.toggle('userMessageBox_open');
    },
    async sendUserMessage(idx, event){
      try{
        const sendButton = event.currentTarget;
        const textArea = sendButton.previousElementSibling;
        const message = textArea.value;

        const res = await axios.post(`/api/post/message`,{postIdx:idx, message:message},{
          headers:{
            'x-user-token':jsCookie.get('authToken')
          }
        })

        if(res.data.type == 'success'){
          const post = this.posts.find(post => post.idx == idx)
          post.message.push(res.data.data)
          textArea.value = '';
          this.msgScrollToBottom(event);
        }
        else this.$bus.$emit('handleAlert','貼文留言通知',res.data.message,res.data.type)
      }
      catch(e){
        console.log(e)
      }
    },

    // 貼文內文展開
    expandPostText(event){
      const postTop = event.currentTarget.closest('.post_top'); 
      const postText = postTop.nextElementSibling;
      event.currentTarget.querySelector('i').classList.toggle('fa-expand');
      event.currentTarget.querySelector('i').classList.toggle('fa-compress');
      postText.classList.toggle('post_text_expand');
    }

  },
  beforeDestroy(){
    window.removeEventListener('keyup',this.inputKeyUpfunction);
  }
}
</script>

<style scoped>
  .view{
    width: calc(100vw - 250px);
    height: 100vh;
  }
  .posterContainer{
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: space-evenly;
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
    margin-bottom: 15px;
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
    height: 100%;
    object-fit: cover;
  }
  .textArea {
    width: calc(100% - 60px);
    height: 40px;
    line-height: 40px;
    overflow-y: auto;
    padding-left: 20px;
    margin-left: 20px;
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
  .like{
    color: rgb(88, 88, 250);
  }
  .column{
    width: 310px;
    height: 100vh;
    padding-top: 20px;
    box-sizing: border-box;
  }
  .posterBox{
    width: 73%;
    min-width: 623px;
    max-width: calc((100vw - 560px) * 0.73);
    margin-top: 20px;
    height: 100vh;
    box-sizing: border-box;
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
    width: 100%;
    height: calc(100vh - 160px);
    overflow-y:scroll;
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 10px;
    padding-top: 5px;
  }
  .postAll_student{
    height: calc(100vh - 50px);
  }
  .postAll_empty{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .post{
    width: 100%;
    height: auto;
    box-shadow: 0px 1px 3px gray;
    border-radius: 5px;
    position: relative;
    margin-bottom: 15px;
    padding-top: 5px;
  }
  .post_more{
    position: absolute;
    top: 10px;
    right: 15px;
  }
  .post_top{
    width: 95%;
    height: 55px;
    margin: 0 auto;
    display: flex;
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
    height: 100%;
    object-fit: cover;
    display: inline-block;
  }
  .post_top_detail{
    width: 90%;
    height: 40px;
    line-height: 20px;
    margin-left: 12px;
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
  .post_text_expand_logo{
    position: absolute;
    top: 38px;
    right: 15px;
  }
  .post_text_expand_logo:hover{
    cursor: pointer;
  }
  .post_text{
    width: 94.5%;
    margin: 0 auto;
    margin-top: 5px;
    margin-bottom: 5px;
    max-height: 103px;
    line-height: 1.5;
    font-size: 16px;
    text-align: justify;
    overflow-y:scroll;
    word-break: break-all;
  }
  .post_text_expand{
    max-height: none !important;
  }
  .post_img{
    width: 100%;
    min-height: 300px !important;
    height: calc((100vw - 250px) * 0.3) !important;
    height: auto;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .carousel_img{
    width: 100%;
    min-height: 300px !important;
    height: calc((100vw - 250px) * 0.3) !important;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .carousel_img>img{
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  ::v-deep .el-carousel__container{
    min-height: 300px !important;
    height: calc((100vw - 250px) * 0.3) !important;
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
    height: auto;
    margin: 0 auto;
  }
  .userMessageBox{
    border-top: 1px solid rgba(0,0,0,0.1);
    width: 100%;
    height: 0;
    max-height: 250px;
    overflow-y: scroll;
    position: relative;
    display: none;
  }
  .userMessage{
    width: 100%;
    min-height: 25px;
    line-height: 25px;
    height: auto;
    padding-left: 5px;
    padding-right: 5px;
    word-wrap: break-word;
    box-sizing: border-box;
    font-size: 14px;
  }
  .userMessage_active{
    width: 100%;
    display: flex;
    box-sizing: border-box;
    padding-top: 10px;
  }
  .userMessage_active_img{
    width: 35px;
    height: 35px;
    border-radius: 35px;
  }
  .userMessage_active_msgBox{
    max-width: calc(100% - 44px);
    margin-left: 9px;
    border-radius: 10px;
    background: #F0F2F5;
    padding: 7px;
    padding-left: 10px;
    padding-right: 10px;
  }
  .userMessage_active_name{
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  .userMessage_active_createTime{
    font-size: 9px;
    display: inline-block;
    margin-left: 7.5px;
    color: gray;
  }
  .userMessage_active_msg{
    font-size: 14px;
    line-height: 1.5;
    word-break: break-all;
  }
  .userMessageBox_open{
    height: auto;
    display: block;
  }
  .post_summary{
    width: 100%;
    height: 40px;
    position: relative;
    align-items: center;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }
  .post_summary_thumb{
    color:gray;
    line-height: 40px;
    text-align: left;
    position: absolute;
  }
  .post_summary_thumb_icon{
    color: rgb(0, 132, 255);
    margin-right: 5px;
    margin-left: 5px;
  }
  .post_summary_msg{
    line-height: 40px;
    color:gray;
    margin-right: 10px;
    text-align: right;
  }
  .post_summary_msg_icon{
    color:gray;
    margin-left: 3px;
  }
  .post_option_box{
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-evenly;
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
    position: sticky;
    bottom: 0;
    left: 0;
    background: white;
  }
  .viewer_inputTextBoxImg{
    width: 35px;
    height: 35px;
    border-radius: 35px;
  }
  .viewer_textArea {
    width: 90%;
    height: 35px;
    padding-top: 9px;
    line-height: 17.5px;
    overflow-y: auto;
    padding-left: 20px;
    padding-right: 20px;
    margin-left: 10px;
    margin-right: 5px;
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
  
  ::v-deep .el-table{
    border-radius: 0 0 4px 4px;
  }
</style>