<template>
  <div>
    <div class="inputBox">
      <div class="inputTextBox">
        <div class="inputTextBoxImg">
          <img :src="currentUser.userImgUrl" alt=""/>
        </div>
        <div class="textArea" @click="showAddBox = true">發表您的貼文和公告</div>
      </div>
      <div class="iconBox">
        <div class="icon_item" @click="showAddBox = true">
          <i class="el-icon-edit-outline icon"></i> 建立貼文
        </div>
        <div class="icon_item"  @click="showAddBox = true">
          <i class="el-icon-picture-outline icon"></i> 建立圖片
        </div>
      </div>
    </div>
    <div class="newPost" v-if="showAddBox">
        <div class="add_top_cancel" @click="addCancel()"><i class="el-icon-delete"></i></div>
        <div class="add_top">
            <div class="add_top_img"><img :src="currentUser.userImgUrl" alt=""></div>
            <div class="add_top_detail">
                <div class="add_top_name">{{ currentUser.name }}</div>
                <div class="add_top_date">{{ timeFormatter() }}</div>
            </div>
        </div>
        <div class="real_input" ref="input" contenteditable="true"></div>
        <el-upload action="#" :auto-upload="false" list-type="picture-card" :on-change="handleUpload" :on-preview="handlePictureCardPreview" :on-remove="handleRemove" :file-list="form.attachments" :multiple="true" accept="image/*"><i class="el-icon-plus"></i></el-upload>
        <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
        <el-button type="primary" class="button" @click="create()" :loading="isSending" >建立貼文</el-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { format } from 'date-fns';
import jsCookie from 'js-cookie';
export default {
    name: "AddPost",
    props: {
        currentUser:{
            type: Object,
            default(){
                return { 
                    userImgUrl: 'img/user.png' 
                }
            }
        }
    },
    mounted(){
        this.inputKeyUpfunction = window.addEventListener('keyup',()=>{
            if(this.showAddBox && this.$refs.input){
                if(this.$refs.input.innerText.trim()=='' && this.$refs.input.innerHTML.length == 4) this.$refs.input.innerHTML = ''
            }
        })
    },
    data() {
        return {
            // 上傳內容
            form:{
                content:'',
                attachments:[]
            },
            isSending:false,
            showPlaceholder:true,
            // 貼文創建
            showAddBox: false,
            inputKeyUpfunction:{},
            // 圖片牆
            dialogImageUrl: '',
            dialogVisible: false,
        };
    },
    methods:{
        // 標準化輸入
        normalizeHTML(html) {
            const div = document.createElement('div');
            div.innerHTML = html;

            // 移除所有 style 屬性
            div.querySelectorAll('*').forEach(el => {
                el.removeAttribute('style');
                el.removeAttribute('class');
            });

            return div.innerHTML;
        },
        // 時間格式處理
        timeFormatter(){
            return format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        },
        // 創建貼文
        async create(){
            this.isSending = true;

            this.form.content = this.normalizeHTML(this.$refs.input.innerHTML);
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
                this.$bus.$emit('handleAddPost');
                this.form = {
                    content:'',
                    attachments:[]
                },
                this.$refs.input.innerHTML = '';
                this.showAddBox = false;
                this.$bus.$emit('handleAlert','貼文創建通知',res.data.message,res.data.type)
            }
            else this.$bus.$emit('handleAlert','貼文創建通知',res.data.message,res.data.type)
            this.isSending = false;
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
        // 取消發文
        addCancel(){
            this.$confirm('此操作將永久刪除該草稿, 是否繼續?', '提示', {
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                type: 'warning',
                customClass:'PWACSS_MessageBox'
            })
            .then(() => {
                this.showAddBox = false;
                this.form.attachments = [];
            })
            .catch(() => {});
        }
    },
    beforeDestroy(){
        window.removeEventListener('keyup',this.inputKeyUpfunction);
    }
};
</script>

<style scoped>
.inputBox {
    width: 100%;
    height: auto;
    min-height: 120px;
    box-shadow: 0px 1px 3px gray;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
}
.inputTextBox {
    width: 95%;
    height: 60px;
    margin: 0 auto;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.inputTextBoxImg {
    width: 40px;
    height: 40px;
    border-radius: 40px;
    overflow: hidden;
}
.inputTextBoxImg > img {
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
    background-color: #f0f2f5;
    box-sizing: border-box;
    color: gray;
}
.textArea:hover {
    cursor: pointer;
    background-color: rgb(240, 240, 240);
}
.iconBox {
    width: 95%;
    height: 60px;
    margin: 0 auto;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
}
.icon_item {
    width: 50%;
    height: 55px;
    line-height: 55px;
    text-align: center;
    border-radius: 5px;
}
.icon_item:hover {
    cursor: pointer;
    background-color: rgba(240, 240, 240);
}
.icon{
    margin-right: 5px;
}
.newPost{
    width: 100%;
    height: auto;
    margin-top: 20px;
    margin-bottom: 10px;
    padding-bottom: 10px;
    padding-left: 2.5%;
    padding-right: 2.5%;
    padding-top: 5px;
    box-sizing: border-box;
    border-radius: 5px;
    box-shadow: 0px 1px 3px gray;
    position: relative;
}
.real_input{
    width: 100%;
    height: auto;
    min-height: 100px;
    line-height: 1.5;
    margin: 0 auto;
    margin-bottom: 20px;
    box-sizing: border-box;
    position: relative;
}
.real_input:focus{
    outline: none;
}
.real_input:empty::before {
    content: "請輸入您要發表的貼文內容，超連結可善用 @href=[your url]";
    color: #aaa;
    position: absolute;
    top: 0px;
    left: 0px;
    font-size: 16px;
    pointer-events: none;
}
.button{
    margin-top: 20px;
    width: 100%;
}

.add_top{
    width: 100%;
    height: 55px;
    margin: 0 auto;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}
.add_top_img{
    width: 40px;
    height: 40px;
    border-radius: 40px;
    box-sizing: border-box;
    overflow: hidden;
}
.add_top_img>img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
    display: inline-block;
}
.add_top_detail{
    width: 90%;
    height: 40px;
    line-height: 20px;
    margin-left: 12px;
}
.add_top_name{
    width: 100%;
    font-size: 16px;
    overflow-y: scroll;
}
.add_top_date{
    width: 100%;
    font-size: 10px;
}
.add_top_cancel{
    width: 30px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    color: red;
    top: 7.5px;
    right: 7.5px;
    position: absolute;
}
.add_top_cancel:hover{
    cursor: pointer;
}
</style>