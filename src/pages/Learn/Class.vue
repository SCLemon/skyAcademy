<template>
  <div class="view">
    <div class="box">
        <div class="pdf pdf_empty" v-if="!materials.length">
            <el-empty description="本專欄暫無資料"></el-empty>
        </div>
        <div class="pdf" v-else>
            <pdf-viewer :pdfUrl="pdfUrl"></pdf-viewer>
        </div>
        <div class="column">
            <div class="list_add" @click="openUpload()" v-if="showUploadOption"><i class="fa-solid fa-cloud-arrow-up upload_icon"></i>Upload Chapter</div>
            <div class="list_add" v-else @click="toggleList()"><i class="fa-solid fa-list upload_icon"></i>Chapter List</div>
            <div class="list_box" ref="list_box">
                <div class="list right-list" v-for="(chapter,id) in materials" :key="id">
                    <div class="list_chapter right-list-target" @click="viewChapter(chapter,id)">Chapter {{ id+1 }}</div>
                    <div class="list_title" @click="viewChapter(chapter,id)">{{ chapter.title }}</div>
                    <div v-if="showUploadOption" class="edit" @click="openUpdate(chapter)"><i class="fa-regular fa-pen-to-square"></i></div>
                </div>
            </div>
        </div>
    </div>
    <el-dialog title="上傳文件" :visible.sync="dialogTableVisible">
        創建章節：<el-input class="form_input" v-model="form.title" placeholder="請輸入章節名稱"></el-input>
        文件上傳：
        <el-upload class="upload-demo" drag action="#" :auto-upload="false" :limit="1" accept=".pdf" :on-change="handleUpload" :on-remove="handleRemove" :file-list="form.fileList">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">將文件拖到此處，或<em>點擊上傳</em></div>
            <div class="el-upload__tip" slot="tip">只能上傳 PDF 文件</div>
        </el-upload>
        <el-button type="primary" class="sendBtn" :loading="isSending" :disabled="(form.title =='' || form.fileList.length == 0)" @click="(form.title =='' || form.fileList.length == 0)?'':create()">確認上傳</el-button>
    </el-dialog>
    <el-dialog title="更新文件" :visible.sync="dialogTableVisible2">
        更新章節：<el-input class="form_input" v-model="update.title" placeholder="請輸入章節名稱"></el-input>
        文件上傳：
        <el-upload class="upload-demo" drag action="#" :auto-upload="false" :limit="1" accept=".pdf" :on-change="handleUpload2" :on-remove="handleRemove2" :file-list="update.fileList">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">將文件拖到此處，或<em>點擊上傳</em></div>
            <div class="el-upload__tip" slot="tip">只能上傳 PDF 文件</div>
        </el-upload>
        <el-button type="primary" class="sendBtn" :loading="isSending2" :disabled="(update.title =='' || update.fileList.length == 0)" @click="(update.title =='' || update.fileList.length == 0)?'':updateChapter()">確認更新</el-button>
        <el-button type="danger" class="sendBtn" :loading="isSending3" @click="removeChapter()">確認刪除</el-button>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import jsCookie from 'js-cookie';
import pdfViewer from './components/PdfViewer.vue';
export default {
    name:'Class',
    components:{
        pdfViewer
    },
    data(){
        return {
            currentUser:{},
            courseIdx:this.$route.query.idx,
            materials:[],
            pdfUrl:'',

            // 上傳
            form:{
                title:'',
                fileList:[]
            },
            dialogTableVisible:false,
            attachment:[],
            isSending:false,
            showUploadOption:false,

            // 更新
            update:{
                materialIdx:'',
                title:'',
                fileList:[],
            },
            dialogTableVisible2:false,
            attachment2:[],
            isSending2:false,

            // 刪除
            isSending3:false,
        }
    },
    async mounted(){
        await this.getData();
        this.currentUser = this.$bus.$currentUser
        if(this.currentUser && this.currentUser.typeEng == 'teacher') this.showUploadOption = true;
    },
    methods:{
        toggleList(){
            this.$refs['list_box'].classList.toggle('list_box_close');
        },
        async getData(){
            const res = await axios.get(`/api/learn/getCourseMaterial/${this.courseIdx}`,{
                headers:{
                    'x-user-token':jsCookie.get('authToken')
                }
            });
            this.materials = res.data.materials;
            this.$nextTick(()=>{
                document.querySelectorAll('.right-list-target')[0].click();
            })
        },
        async viewChapter(chapter,id){
            const lists = document.querySelectorAll('.right-list');
            // 移除全部的 list_selected
            lists.forEach(el => el.classList.remove('list_selected'));
            // 幫指定 id 的加上
            if (lists[id]) {
                lists[id].classList.add('list_selected');
            }
            this.pdfUrl = chapter.attachmentUrl;
        },

        // 上傳
        openUpload(){
            this.dialogTableVisible = true;
        },
        handleUpload(file,fileList){
            this.form.fileList = fileList
        },
        handleRemove(file, fileList) {
            this.form.fileList = fileList
        },
        async create(){
            try{
                this.isSending = true;
                let formData = new FormData();
                formData.append('idx', this.courseIdx);
                formData.append('title', this.form.title);
                if (this.form.fileList && this.form.fileList.length > 0) {
                    this.form.fileList.forEach((file, index) => {
                        formData.append('attachments', file.raw);
                    });
                
                }
                const res = await axios.post('/api/learn/createMaterial', formData, {
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    }
                })
                if(res.data.type == 'success'){
                    this.dialogTableVisible = false;
                    this.form.title = '';
                    this.form.fileList = [];
                    await this.getData();
                    this.$bus.$emit('handleAlert','章節創建通知',res.data.message, res.data.type)
                }
            }
            catch(e){}
            finally{
                this.isSending = false;
            }
        },

        // 更新
        async openUpdate(chapter){
            this.update.title = chapter.title;
            this.update.materialIdx = chapter.idx;
            this.dialogTableVisible2 = true;
        },
        handleUpload2(file,fileList){
            this.update.fileList = fileList
        },
        handleRemove2(file, fileList) {
            this.update.fileList = fileList
        },
        async updateChapter(){
            try{
                this.isSending2 = true;
                let formData = new FormData();
                formData.append('idx', this.courseIdx);
                formData.append('materialIdx',this.update.materialIdx)
                formData.append('title', this.update.title);
                if (this.update.fileList && this.update.fileList.length > 0) {
                    this.update.fileList.forEach((file, index) => {
                        formData.append('attachments', file.raw);
                    });
                
                }
                const res = await axios.post('/api/learn/modifyMaterial', formData, {
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    }
                })
                if(res.data.type == 'success'){
                    this.dialogTableVisible2 = false;
                    this.update.title = '';
                    this.update.fileList = [];
                    this.update.materialIdx = '';
                    await this.getData();
                    this.$bus.$emit('handleAlert','章節更新通知',res.data.message, res.data.type)
                }
            }
            catch(e){}
            finally{
                this.isSending2 = false;
            }
        },

        // 刪除
        async removeChapter(chapter){
            this.isSending3 = true;
            try{
                const res = await axios.get(`/api/learn/deleteMaterial/${this.courseIdx}/${this.update.materialIdx}`,{
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    }
                });
                if(res.data.type == 'success'){
                    this.dialogTableVisible2 = false;
                    this.update.title = '';
                    this.update.fileList = [];
                    this.update.materialIdx = '';
                    await this.getData();
                    this.$bus.$emit('handleAlert','章節刪除通知',res.data.message, res.data.type)
                }
            }
            catch(e){
                
            }
            finally{
                this.isSending3 = false;
            }
        }
    }
}
</script>

<style scoped>
    .view{
        width: calc(100vw - 250px);
        height: 100vh;
    }
    .box{
        width:100%;
        display: flex;
        height: 100vh;
    }
    .pdf{
        width: calc(100% - 335px);
        height: 100vh;
        box-sizing: border-box;
        padding-left: 3px;
    }
    .pdf_empty{
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .column{
        width: 335px;
        height: 100vh;
        box-sizing: border-box;
    }
    .list_box{
        width: 100%;
        height: calc(100vh - 100px);
        box-sizing: border-box;
        overflow-y: scroll;
        padding-left: 10px;
        padding-right: 10px;
        position: relative;
        transition: all 0.5s ease;
    }
    .list_box_close{
        height: 0vh;
        opacity: 0;
    }
    .list_add{
        width: calc(100% - 20px);
        height: 80px;
        line-height: 80px;
        box-sizing: border-box;
        margin: 10px;
        text-align: center;
        font-size: 18px;
        border-radius: 10px;
        color:white;
        position: static;
        background: rgba(0,0,0,0.92);
        transition: background 0.3s;
    }
    .list_add:hover{
        cursor: pointer;
        background: rgba(0,0,0,1);
    }
    .upload_icon{
        margin-right: 10px;
    }
    .list{
        width: 100%;
        height: calc((100vh - 80px)/9);
        position: relative;
        line-height: calc((100vh - 80px)/9);
        box-sizing: border-box;
        display: flex;
        justify-content: space-around;
        padding-left: 10px;
        padding-right: 10px;
    }
    .list:hover, .list_selected{
        cursor: pointer;
        background: rgba(0,0,0,0.05);
    }
    
    .list_chapter{
        width: 100px;
        font-weight: bolder;
        font-size: 16px;
    }
    .list_title{
        width: 200px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 16px;
    }
    .edit{
        height: 30px;
        width: 30px;
        line-height: 30px;
        text-align: center;
        margin-right: -8px;
    }
    .form_input{
        margin-top: 15px;
        margin-bottom: 15px;
    }
    .upload-demo{
        margin-top: 15px;
    }
    .sendBtn{
        margin-top: 15px;
        width: 100%;
    }
    ::v-deep .el-dialog{
        width: 50vw;
    }
    ::v-deep .el-upload-dragger{
        width: calc(50vw - 40px);
    }
    ::v-deep .el-button+.el-button{
        margin-left: 0 !important;
    }
</style>