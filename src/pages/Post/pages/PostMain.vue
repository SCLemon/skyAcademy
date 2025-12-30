<!-- 發文帖子 -->
<template>
  <div>
    <div class="posterBox">
        <div class="searchBox">
          <div class="search_input_div"><input type="search" class="search_input" v-model="q" placeholder="搜尋 Lemon's Universe 的貼文"></div>
          <div class="search_icon_div" @click="searchPost()"><i class="fa-solid fa-magnifying-glass"></i></div>
        </div>
        <div class="postAll_wrapper" ref="postAll_wrapper" @scroll="postDivScroll()">
          <add-post v-if="!hideCreatePostBox && currentUser && currentUser.typeEng == 'teacher'" :currentUser="currentUser"></add-post>
          <div class="postAll" ref="postAll" v-if="posts.length">
            <div class="post" v-for="(obj,id) in posts" :key="id">
              <div class="post_more" v-if="showPermission">
                <template v-if="obj.modifying">
                  <button class="modifying_button" type="primary" @click="modifyPost(obj, $event)">儲存</button>
                  <button class="modifying_button" @click="cancelModifyPost(obj)">取消</button>
                </template>
                <div class="post_more_option_wrapper" v-else-if="!obj.modifying">
                  <i class="el-icon-more icon_more" @click.stop="toggleOption(obj)"></i>
                  <transition name="fade">
                    <div class="post_more_option_box" v-show="obj.showOption">
                      <div class="post_more_option" @click="openModifyBox(obj)"><i class="el-icon-edit"></i> 編輯貼文</div>
                      <div class="post_more_option" @click="deletePost(obj.idx)"><i class="el-icon-delete"></i> 刪除貼文</div>
                    </div>
                  </transition>
                </div>
              </div>
              <div class="post_top">
                <div class="post_top_img"><img :src="obj.creator.userImgUrl?obj.creator.userImgUrl:'img/user.png'" alt=""></div>
                <div class="post_top_detail">
                  <div class="post_top_name">{{ obj.creator.name }}</div>
                  <div class="post_top_date">{{obj.createTime}}</div>
                </div>
              </div>
              <div class="post_text" v-if="obj.content.trim()!='' && !obj.modifying" :key="'view-' + obj.idx" v-html="linkify(obj.content)"></div>
              <div class="post_text post_text_modifying" :ref="`modifyBox-${obj.idx}`" v-else-if="obj.modifying" :key="'edit-' + obj.idx" v-html="saveRender(obj.temp_content)" contenteditable="true"></div>
              <div class="post_text_expand_logo" v-if="checkPostTextOverflow(obj.content) && !obj.modifying" @click="expandPostText($event)">... 顯示更多</div>
              <div class="post_img" v-if="obj.postImg.length">
                <el-carousel :autoplay="false" :loop="false">
                  <el-carousel-item v-for="(item,id) in obj.postImg" :key="id">
                    <div class="carousel_img" @click="showPostImgDetail(item.url)"><img src="img/Loading.gif" :data-src="item.url" v-lazy alt=""></div>
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
                  <div class="post_option" @click="openShare(obj.idx)"><i class="fa-regular fa-share-from-square icon"></i> 分享</div>
                </div>
                <div class="userMessageBox">
                  <div class="userMessage" style="text-align: center; color:gray; font-size: 14px;" v-if="!obj.message.length">目前暫時沒有人留言</div>
                  <div class="userMessage_active" v-for="(item,id) in obj.message" :key="id">
                    <img class="userMessage_active_img" src="img/user.png" :data-src="item.userImgUrl" v-lazy alt="" loading="lazy">
                    <div class="userMessage_active_msgBox">
                      <div class="userMessage_active_name">{{ item.name }} <img class="userMessage_activ_badge" :src="item.level?`img/badge/${item.level}.png`:'img/badge/1.png'" alt=""><span class="userMessage_active_createTime">{{ item.createTime }}</span></div>
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
          <div class="postAll_empty" v-else>
            <el-empty description="暫無貼文"></el-empty>
          </div>
        </div>
    </div>
    <el-dialog title="分享貼文" :visible.sync="dialogTableVisible">
      <div class="copyLinkTitle">Share via</div>
      <div class="shareViaBox">
        <div class="shareViaItem" @click="shareVia('facebook')">
          <img class="shareEachIcon" src="img/socialIcon/facebook.png" alt="">
          <div class="shareEachTitle">Facebook</div>
        </div>
        <div class="shareViaItem" @click="shareVia('twitter')">
          <img class="shareEachIcon" src="img/socialIcon/twitter.png" alt="">
          <div class="shareEachTitle">Twitter</div>
        </div>
        <div class="shareViaItem" @click="shareVia('line')">
          <img class="shareEachIcon" src="img/socialIcon/line.png" alt="">
          <div class="shareEachTitle">Line</div>
        </div>
        <div class="shareViaItem" @click="shareVia('linkedin')">
          <img class="shareEachIcon" src="img/socialIcon/linkedin.png" alt="">
          <div class="shareEachTitle">LinkedIn</div>
        </div>
        <div class="shareViaItem" @click="shareVia('pinterest')">
          <img class="shareEachIcon" src="img/socialIcon/pinterest.png" alt="">
          <div class="shareEachTitle">Pinterest</div>
        </div>
        <div class="shareViaItem" @click="shareVia('whatsapp')">
          <img class="shareEachIcon" src="img/socialIcon/whatsapp.png" alt="">
          <div class="shareEachTitle">WhatsApp</div>
        </div>
        <div class="shareViaItem" @click="shareVia('telegram')">
          <img class="shareEachIcon" src="img/socialIcon/telegram.png" alt="">
          <div class="shareEachTitle">Telegram</div>
        </div>
      </div>
      <div class="copyLinkTitle">Or copy link</div>
      <div class="shareBox">
        <div class="shareUrl">{{ shareUrl }}</div>
        <div class="shareButton" @click="copyShareUrl()">{{shareStatus}}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import jsCookie from 'js-cookie'
import AddPost from '../components/AddPost.vue';
import DOMPurify from 'dompurify';
export default {
  name:'PostMain',
  components:{
    AddPost
  },
  data(){
    return {
      currentUser:{},
      isSending:false,
      // 顯示貼文
      q:'',
      share:'',
      posts:[],
      page:1,
      showPermission:false,
      hideCreatePostBox: false,
      isLoading: false, // 加載狀態，避免重複請求

      // 分享貼文內容
      dialogTableVisible: false,
      shareUrl:'',
      shareStatus:'Copy'
      
    }
  },
  async mounted(){
    await this.getPost()
    await this.getUserInfo()
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.$bus.$on('handleAddPost', this.handleAddPost);;
  },
  watch:{
    '$route.params.share':{
      deep: true,
      async handler(){
        this.dialogTableVisible = false;
        this.posts = [];
        this.page = 1;
        await this.getPost();
      }
    }
  },
  methods:{
    // 處理 AddPost.vue 邏輯
    async handleAddPost(){
      this.q = '';
      this.posts = [];
      this.page = 1;
      await this.getPost()
    },
    // 轉換內文中的 @href=[url]
    linkify(text){
      if (!text) return "";

      let result = "";
      let remaining = text;

      const marker = "@href=[";
      let index;

      while ((index = remaining.indexOf(marker)) !== -1) {
        result += remaining.slice(0, index);
        const start = index + marker.length;
        const end = remaining.indexOf("]", start);
        if (end === -1) {
          result += remaining.slice(index);
          remaining = "";
          break;
        }

        const url = remaining.slice(start, end).trim();
        result += `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;

        remaining = remaining.slice(end + 1);
      }

      result += remaining;
      return this.saveRender(result);
    },
    saveRender(text){ // 避免 XSS
      return DOMPurify.sanitize(text);
    },
    toggleOption(obj) {
      if (obj.showOption === undefined) {
        this.$set(obj, 'showOption', true);
      } 
      else {
        obj.showOption = !obj.showOption;
      }
    },

    async getUserInfo(){
      const token = jsCookie.get('authToken');
      if(!token) return 
      try{
        const res = await axios.post('/login/token',{save:false},{
          headers:{
            'x-user-token':token,
            'x-user-fingerprint':localStorage.getItem('deviceFingerprint')
          }
        })
        if(res.data.type == 'success'){
          this.showPermission = (res.data.userInfo.typeEng == 'teacher')
        }
      }
      catch(e){}
    },
    openShare(idx){
      let text = location.protocol+'//'+location.host + '/#/academic/post/' + idx;
      this.shareUrl = text;
      this.shareStatus = 'COPY';
      this.dialogTableVisible = true;
    },
    async shareVia(target){
      const url = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.shareUrl)}&text=${encodeURIComponent("快來看看檸檬小天地")}`,
        line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(this.shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.shareUrl)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(this.shareUrl)}&media=${encodeURIComponent(this.imageUrl || "")}&description=${encodeURIComponent("快來看看檸檬小天地")}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent("快來看看檸檬小天地 " + this.shareUrl)}`,
        telegram:`https://t.me/share/url?url=${encodeURIComponent(this.shareUrl)}&text=${encodeURIComponent("快來看看檸檬小天地")}`
      };
      window.open(url[target],"_blank", "width=600,height=500")
    },
    async copyShareUrl(){
      this.$bus.$emit('copyToClipboard','分享貼文連結通知' , this.shareUrl);
      this.shareStatus = '✓ COPIED'
    },
    async postDivScroll(){
      
      const target = this.$refs['postAll_wrapper'];
      this.share = this.$route.params.share ?? null;

      const bottomThreshold = 2; // 容許誤差
      if (!this.share && target.scrollTop + target.clientHeight >= target.scrollHeight - bottomThreshold){
        await this.getPost();
      }
    },
    async searchPost(){
      await this.$router.replace('/academic/post').catch((e)=>{});
      this.posts = [];
      this.page = 1;
      await this.getPost();
    },
    async getPost(){
      if (this.isLoading) return;
      this.isLoading = true;

      this.share = this.$route.params.share ?? null;
      let url =''
      if(this.share) url = `/api/post/share/${this.share}`;
      else url = `/api/post/getPost?page=${this.page}${this.q ? `&q=${this.q}` : ''}`;

      try{
        const res = await axios.get(url,{
          headers:{
              'x-user-token':jsCookie.get('authToken'),
          }
        })
        if(res.data.type == 'success'){
          const newPosts = res.data.posts;

          if(this.share){
             this.posts = newPosts;
             this.page = 1;
          }
          else {
            this.posts = this.posts.concat(newPosts);
            this.page++;
          }

          this.$nextTick(async() => {
            const target = this.$refs['postAll_wrapper'];
            if (!this.share && target && target.scrollHeight <= target.clientHeight && newPosts.length > 0) {
              await this.getPost();
            }
          });

          this.hideCreatePostBox = (this.q || this.share); // 若查詢或分享狀態 --> 將貼文 Box 進行隱藏
          
        }
        else this.$bus.$emit('handleAlert','貼文獲取通知',res.data.message,res.data.type)
      }
      catch(e){}
      finally{
        this.isLoading = false;
      }
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
          this.posts = [];
          this.page = 1;
          await this.getPost();
          this.$bus.$emit('handleAlert','貼文刪除通知',res.data.message,res.data.type)
        }
        else this.$bus.$emit('handleAlert','貼文刪除通知',res.data.message,res.data.type)
      }
      catch(e){}
    },
    // 修改貼文
    normalizeHTML(html){
      const div = document.createElement('div');
      div.innerHTML = html;

      // 移除所有 style 屬性
      div.querySelectorAll('*').forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('class');
      });

      return div.innerHTML;
    },
    async openModifyBox(obj){

      if (!('modifying' in obj)) this.$set(obj, 'modifying', true)
      else obj.modifying = true;

      if (!('temp_content' in obj)) this.$set(obj, 'temp_content', obj.content);
      else obj.temp_content = obj.content;

      this.$nextTick(()=>{
        let modifyBox = this.$refs[`modifyBox-${obj.idx}`][0];
        if(modifyBox){
          modifyBox.focus();

          const range = document.createRange();
          range.selectNodeContents(modifyBox);
          range.collapse(false); // false = 移到最後

          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      })
      obj.showOption = false;
    },
    async modifyPost(obj){
      try{
        let modifyContent = this.normalizeHTML(this.$refs[`modifyBox-${obj.idx}`][0].innerHTML);
      
        const res = await axios.post(`/api/post/modifyPost/${obj.idx}`,{content: modifyContent},{
          headers:{
            'x-user-token':jsCookie.get('authToken')
          }
        })
        if(res.data.type == 'success'){
          obj.content = modifyContent;
          obj.temp_content = '';
          obj.modifying = false;
          this.$bus.$emit('handleAlert','貼文修改通知',res.data.message,res.data.type)
        }
        else this.$bus.$emit('handleAlert','貼文修改通知',res.data.message,res.data.type)
      }
      catch(e){
        this.$bus.$emit('handleAlert','貼文修改通知','修改貼文失敗（參數遺失）','error')
      }
    },
    cancelModifyPost(obj){
      obj.modifying = false;
      obj.temp_content = '';
    },
    //
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
    checkPostTextOverflow(htmlContent, maxHeight = 168) {
      // 建立暫時容器
      const temp = document.createElement('div');
      temp.style.wordBreak = 'break-all'
      temp.style.position = 'absolute';
      temp.style.visibility = 'hidden';
      temp.style.lineHeight = '1.5'
      
      const reference = document.querySelector('.post_text');
      const width = reference ? reference.clientWidth + 'px' : '589px';
      temp.style.width = width;


      temp.innerHTML = htmlContent;

      document.body.appendChild(temp);
      const exceeds = temp.offsetHeight > maxHeight;
      document.body.removeChild(temp);

      return exceeds;
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
      
      this.$nextTick(()=>{
        if (userMessageBox) {
          const rect = userMessageBox.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            userMessageBox.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }
      })
    },
    async sendUserMessage(idx, event){
      try{
        const sendButton = event.currentTarget;
        const textArea = sendButton.previousElementSibling;
        const message = textArea.value;

        const res = await axios.post(`/api/post/message`,{postIdx:idx, message:message},{
          headers:{
            'x-user-token':jsCookie.get('authToken'),
            'x-user-fingerprint': localStorage.getItem('deviceFingerprint')
          }
        })

        if(res.data.type == 'success'){
          const post = this.posts.find(post => post.idx == idx)
          post.message.push(res.data.data)
          textArea.value = '';
          this.msgScrollToBottom(event);
          
          const userMessageBox = event.target.closest('.userMessageBox')
          this.$nextTick(()=>{
            const post_viewer_input_box = userMessageBox.querySelector('.post_viewer_input_box');
            if (post_viewer_input_box) {
              const rect = post_viewer_input_box.getBoundingClientRect();
              if (rect.bottom > window.innerHeight) {
                post_viewer_input_box.scrollIntoView({ behavior: 'smooth', block: 'end' });
              }
            }
          })
        }
        else this.$bus.$emit('handleAlert','貼文留言通知',res.data.message,res.data.type)
      }
      catch(e){
        console.log(e)
      }
    },

    // 貼文內文展開
    expandPostText(event){
      const post = event.currentTarget.closest('.post'); 
      const postText = post.querySelector('.post_text');
      event.currentTarget.innerText == '... 顯示更多'? event.currentTarget.innerText = '顯示更少':event.currentTarget.innerText = '... 顯示更多'
      postText.classList.toggle('post_text_expand');
    },
    // 貼文圖片展開
    showPostImgDetail(imgUrl){
      let url = location.protocol+'//'+location.host + imgUrl;
      window.open(url, '_blank')

    }
  },
}
</script>

<style scoped>

  .fade-enter-active,.fade-leave-active {
    transition: opacity 0.25s ease;
  }
  .fade-enter,.fade-leave-to {
    opacity: 0;
  }
  .posterBox{
    width:100%;
    height: 100vh;
    box-sizing: border-box;
  }
  .searchBox{
    width: 100%;
    height: 50px;
    box-shadow: 0px 1px 3px gray;
    margin-bottom: 20px;
    border-radius: 60px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
  .search_input_div{
    width: 87.5%;
    height: 35px;
    border-right: 1px solid rgba(0,0,0,0.1);
    padding-left: 20px;
    padding-right: 10px;
  }
  .search_input{
    width: 100%;
    height: 35px;
    line-height: 35px;
    box-sizing: border-box;
    border: 0;
    font-size: 16px;
  }
  .search_input:focus{
    outline: 0;
  }
  .search_input::placeholder{
    font-size: 16px;
  }
  .search_input::-webkit-search-cancel-button{
    -webkit-appearance: none;  /* 取消預設樣式 */
    height: 13px;
    width: 13px;
    margin-left: 7px;
    background-color: rgba(0,0,0,0.2);
    mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><path stroke="white" stroke-width="2" d="M2,2 L10,10 M10,2 L2,10"/></svg>') no-repeat center;
    -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><path stroke="white" stroke-width="2" d="M2,2 L10,10 M10,2 L2,10"/></svg>') no-repeat center;
    cursor: pointer;
    transition: 0.3s background-color ease;
  }
  .search_input::-webkit-search-cancel-button:hover{
    background-color: rgba(0,0,0,0.7);
  }
  .search_icon_div{
    width: 12.5%;
    height: 50px;
    border-radius: 0 50px 50px 0;
    text-align: center;
    line-height: 50px;
    font-size: 16px;
  }
  .search_icon_div:hover{
    cursor: pointer;
    color: rgba(0,0,0,0.7);
  }
  .icon{
    margin-right: 5px;
  }
  .like{
    color: rgb(88, 88, 250);
  }
  ::v-deep .el-dialog{
    width: 720px;
  }

  .real_input2{
    width: 100%;
    height: auto;
    min-height: 100px;
    max-height: 300px;
    overflow-y: scroll;
    line-height: 1.5;
    margin: 0 auto;
    box-sizing: border-box;
    position: relative;
  }
  .real_input2:focus{
    outline: none;
  }
  .button{
    margin-top: 30px;
    margin-bottom: -10px;
    width: 100%;
  }
  .postAll_wrapper{
    height: calc(100vh - 95px);
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    padding-right: 1px;
    padding-left: 1px;
    padding-top: 2px;
    box-sizing: border-box;
  }
  .postAll{
    width: 100%;
    height: auto;
    padding-top: 5px;
    padding-left: 1px;
    padding-right: 1px;
    box-sizing: border-box;
  }
  .postAll_empty{
    height: 100vh;
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
    box-sizing: border-box;
  }
  .post_more{
    position: absolute;
    top: 10px;
    right: 15px;
  }
  .icon_more{
    width: 30px;
    height: 30px;
    border-radius: 30px;
    line-height: 30px;
    text-align: center;
    transition: 0.3s background ease;
  }
  .icon_more:hover{
    cursor: pointer;
    background: rgba(0,0,0,0.05);
  }
  .post_more_option_wrapper{
    position: relative;
  }
  .post_more_option_box{
    position: absolute;
    width: 100px;
    height: auto;
    margin-top: 4px;
    right: 5px;
    box-shadow: 0px 2px 2px rgba(0,0,0,0.2);
    border-radius: 2px;
    overflow: hidden;
    z-index: 999;
    background: white;
  }
  .post_more_option{
    width: 100%;
    height: 35px;
    line-height: 35px;
    text-align: center;
    font-size: 12px;
  }
  .post_more_option:hover{
    cursor: pointer;
    background: rgba(0,0,0,0.05);
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
    width:94.5%;
    margin: 0 auto;
    text-align: right;
    font-size: 14px;
    margin-bottom: 7.5px;
    font-weight: bolder;
  }
  .post_text_expand_logo:hover{
    cursor: pointer;
  }
  .post_text{
    width: 94.5%;
    margin: 0 auto;
    margin-top: 5px;
    margin-bottom: 10px;
    max-height: 147px;
    line-height: 1.5;
    font-size: 14px;
    text-align: justify;
    overflow-y: hidden;
    word-break: break-all;
  }
  .post_text_expand{
    max-height: none !important;
  }
  .post_text_modifying{
    overflow-y: scroll;
    max-height: none;
  }
  .post_text_modifying:focus{
    outline: none;
  }
  .modifying_button{
    font-size: 10px;
    line-height: 18px;
    margin-left: 5px;
    border: 0;
    transition: 0.3s box-shadow ease;
    border-radius: 3px;
  }
  .modifying_button:hover{
    cursor: pointer;
    box-shadow: 0px 0.5px 1px rgba(0,0,0,0.3);
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
  .carousel_img:hover{
    cursor: pointer;
  }
  .carousel_img>img{
    max-width: 100%;
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
    width: 100%;
    height: auto;
    margin: 0 auto;
  }
  .userMessageBox{
    width: 95%;
    margin: 0 auto;
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
    display: flex;
    align-items: center;
  }
  .userMessage_activ_badge{
    width: 20px;
    height: 20px;
    object-fit: contain;
    margin-left: 3px;
  }
  .userMessage_active_createTime{
    font-size: 9px;
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
    width: 95%;
    margin: 0 auto;
    height: 40px;
    position: relative;
    align-items: center;
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
    width: calc(100% / 3);
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
  .shareViaBox{
    width: 100%;
    height: 80px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .shareViaItem{
    width: 80px;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    transition: 0.5s box-shadow ease;
    border-radius: 3px;
  }
  .shareViaItem:hover{
    cursor: pointer;
    box-shadow: 2px 2px 3px gray;
  }
  .shareEachIcon{
    width: 50px;
    height: 50px;
    object-fit: contain;
    margin: 0 auto;
  }
  .shareEachTitle{
    width: 100%;
    text-align: center;
  }
  .copyLinkTitle{
    margin-bottom: 10px;
    font-weight: bolder;
    color: black;
  }
  .shareBox{
    width: 100%;
    height: 40px;
    border: 1px solid rgba(0,0,0,0.3);
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .shareUrl{
    width: calc(100% - 110px);
    height: 40px;
    line-height: 40px;
    padding-left: 5px;
    padding-right: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .shareButton{
    width: 80px;
    height: 35px;
    line-height: 35px;
    color: blue;
    text-align: center;
    transition: 0.5s box-shadow ease;
    box-sizing: border-box;
    border-radius: 35px;
  }
  .shareButton:hover{
    cursor: pointer;
    box-shadow: 0px 1px 3px gray;
  }
</style>