<template>
  <div class="view">
    <div class="mobile_column_wrapper">
        <div class="mobile_column" @click="isOpenMobileList = !isOpenMobileList">
            <div class="mobile_column_currentChapter_title">{{currentChapter?.title}}</div>
            <i :class="{'el-icon-arrow-down': true, arrow:true, rotateArrow: isOpenMobileList}"></i>
        </div>
        <div class="mobile_column_list" ref="mobile_column_list" v-if="isOpenMobileList">
            <div :class="{mobile_column_list_item: true, mobile_column_list_item_selected: currentChapter.idx == chapter.idx}" v-for="(chapter,id) in materials" :key="id">
                <div class="mobile_column_list_item_chapter_box" @click="viewChapter(chapter)">
                    <div class="mobile_column_list_item_chapter">Chapter {{ id+1 }}</div>
                    <div class="mobile_column_list_item_title">{{ chapter.title }}</div>
                </div>
                <div v-if="showOption" :class="{edit: true, isDownloading:isDownloading}" @click="downloadChapter(chapter)">
                    <i class="el-icon-download" v-if="!chapter.isDownloading"></i>
                    <div v-else class="chapter_file_download_percent">{{ chapter.downloadPercent ?? 0 }}%</div>
                </div>
                <div class="sort_mobile" v-if="showOption" @click="modifyIndex(chapter, 'up')">
                    <i  class="el-icon-arrow-up arrow"></i>
                </div>
                <div class="sort_mobile" v-if="showOption" @click="modifyIndex(chapter, 'down')">
                    <i class="el-icon-arrow-down arrow"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="box">
        <div class="pdf pdf_empty" v-if="!materials.length">
            <el-empty description="本專欄暫無資料"></el-empty>
        </div>
        <div class="pdf" v-else>
            <pdf-viewer :pdfUrl="`${pdfUrl}?${genRefreshPDFNumber}`" 
                        :httpHeaders="{'x-user-token': getToken()}"
                        :preloadCount="2"
            ></pdf-viewer>
        </div>
        <div class="column">
            <div class="list_add" @click="openUpload()" v-if="showOption"><i class="fa-solid fa-cloud-arrow-up upload_icon"></i>Upload Chapter</div>
            <div class="list_add" v-else @click="toggleList()"><i class="fa-solid fa-list upload_icon"></i>Chapter List</div>
            <div :class="{list_box:true}" ref="list_box">
                <div :class="{list: true, list_selected: currentChapter.idx == chapter.idx}" v-for="(chapter,id) in materials" :key="id">
                    <div class="list_chapter right-list-target" @click="viewChapter(chapter)">Chapter {{ id+1 }}</div>
                    <div class="list_title" @click="viewChapter(chapter)">{{ chapter.title }}</div>
                    <div v-if="showOption" :class="{edit: true, isDownloading:isDownloading}" @click="downloadChapter(chapter)">
                        <i class="el-icon-download" v-if="!chapter.isDownloading"></i>
                        <div v-else class="chapter_file_download_percent">{{ chapter.downloadPercent ?? 0 }}%</div>
                    </div>
                    <div class="sort" v-if="showOption">
                        <i @click="modifyIndex(chapter, 'up')" class="el-icon-arrow-up arrow"></i>
                        <i @click="openUpdate(chapter)" class="el-icon-edit pen"></i>
                        <i @click="modifyIndex(chapter, 'down')" class="el-icon-arrow-down arrow"></i>
                    </div>
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
        <el-button type="primary" class="sendBtn" :loading="isSending" :disabled="(form.title =='' || form.fileList.length == 0)" @click="(form.title =='' || form.fileList.length == 0)?'':create()">{{ isSending? `${uploadPercent}%`:'確認上傳' }}</el-button>
    </el-dialog>
    <el-dialog title="更新文件" :visible.sync="dialogTableVisible2">
        更新章節：<el-input class="form_input" v-model="update.title" placeholder="請輸入章節名稱"></el-input>
        文件上傳：
        <el-upload class="upload-demo" drag action="#" :auto-upload="false" :limit="1" accept=".pdf" :on-change="handleUpload2" :on-remove="handleRemove2" :file-list="update.fileList">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">將文件拖到此處，或<em>點擊上傳</em></div>
            <div class="el-upload__tip" slot="tip">只能上傳 PDF 文件</div>
        </el-upload>
        <el-button type="primary" class="sendBtn" :loading="isSending2" :disabled="(update.title =='' || (isSending2 || isSending3))" @click="(update.title =='')?'':updateChapter()">{{isSending2? `${updatePercent}%`:'確認更新' }}</el-button>
        <el-button type="danger" class="sendBtn" :loading="isSending3" :disabled="isSending2 || isSending3" @click="removeChapter()">確認刪除</el-button>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import jsCookie from 'js-cookie';
import pdfViewer from './components/PdfViewer.vue';
import { v4 as uuidv4 } from 'uuid'
export default {
    name:'Column',
    components:{
        pdfViewer
    },
    data(){
        return {
            currentChapter:{},
            courseIdx:this.$route.params.idx,
            materials:[],
            pdfUrl:'',
            genRefreshPDFNumber:'', // 避免 url 緩存
            enableToReadNextPDF: true,

            // 上傳
            uploadPercent:0,
            form:{
                title:'',
                fileList:[]
            },
            dialogTableVisible:false,
            attachment:[],
            isSending:false,
            showOption:false,
            
            // 下載
            isDownloading: false,
            
            // 更新
            updatePercent:0,
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
            // 以下為移動端參數
            isOpenMobileList: false,
        }
    },
    async mounted(){

        // 禁止在前一頁面渲染時跳頁
        this.$bus.$on('toggleEnableToReadNextPDF',this.toggleEnableToReadNextPDF);

        await this.getData();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if(currentUser && currentUser.typeEng == 'teacher') this.showOption = true;
    },
    methods:{
        getToken(){
            return jsCookie.get('authToken');
        },
        toggleList(){
            this.$refs['list_box'].classList.toggle('list_box_close');
        },
        toggleEnableToReadNextPDF(result){
            this.toggleEnableToReadNextPDF = result;
        },
        async getData(method){
            const res = await axios.get(`/api/learn/getCourseMaterial/${this.courseIdx}`,{
                headers:{
                    'x-user-token': this.getToken()
                }
            });
            this.materials = res.data.materials;
            this.$nextTick(()=>{
                const list = document.querySelectorAll('.right-list-target');
                if(!method && list[0]) list[0].click();
                else if(method == 'create') list[list.length - 1].click();
            })
        },
        async viewChapter(chapter){
            if(!this.toggleEnableToReadNextPDF){
                this.$bus.$emit('handleAlert','專欄閱讀通知','請等待頁面渲染完畢再執行此操作。','warning')
                return;
            }
            this.currentChapter = chapter;
            this.genRefreshPDFNumber = uuidv4();
            this.pdfUrl = chapter.attachmentUrl;

            // 若為移動端，可在此自動隱藏選單：
            this.isOpenMobileList = false;
        },
        async downloadChapter(chapter){
            
            if(!this.showOption) return;

            if(this.isDownloading){
                this.$bus.$emit('handleAlert','檔案下載通知','檔案正在執行下載，請稍後再試。', 'warning');
                return;
            }

            this.isDownloading = true;
            chapter.isDownloading = true;

            // 強制初始化綁定屬性
            if (!('downloadPercent' in chapter)) {
                this.$set(chapter, 'downloadPercent', 0);
            }

            try {
                const response = await axios.get(chapter.attachmentUrl, {
                    responseType: "blob",
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    },
                    onDownloadProgress: (progressEvent) => {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        chapter.downloadPercent = percent;
                    },
                });
                
                const blob = new Blob([response.data]);
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);

                const fileName = chapter.title?.replace(/\s+/g, "_") + ".pdf"
                link.download = fileName;

                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }
            catch (error) {
                this.$bus.$emit('handleAlert','檔案下載通知','文件下載失敗。','error')
            }
            finally{
                this.isDownloading = false;
                chapter.isDownloading = false;
                chapter.downloadPercent = 0;
            }
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
                
                // 防呆
                if(this.isSending) return;
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
                        'x-user-token':this.getToken()
                    },
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        this.uploadPercent = percent;
                    },
                    
                })
                if(res.data.type == 'success'){
                    this.dialogTableVisible = false;
                    this.form.title = '';
                    this.form.fileList = [];
                    await this.getData('create');
                    this.$bus.$emit('handleAlert','章節創建通知',res.data.message, res.data.type)
                }
            }
            catch(e){}
            finally{
                this.isSending = false;
                this.uploadPercent = 0;
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

                // 防呆
                if(this.isSending2) return;
                this.isSending2 = true;

                let formData = new FormData();
                formData.append('idx', this.courseIdx);
                formData.append('materialIdx',this.update.materialIdx)
                formData.append('title', this.update.title);

                let hasfileUpdated = false;
                if (this.update.fileList && this.update.fileList.length > 0) {
                    this.update.fileList.forEach((file, index) => {
                        formData.append('attachments', file.raw);
                    });
                    hasfileUpdated = true;
                }
                const res = await axios.post('/api/learn/modifyMaterial', formData, {
                    headers:{
                        'x-user-token':this.getToken()
                    },
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        this.updatePercent = percent;
                    },
                })
                if(res.data.type == 'success'){

                    if(hasfileUpdated && res.data.material.idx == this.currentChapter.idx){
                        this.genRefreshPDFNumber = uuidv4(); // 避免 url 緩存
                    }
                    
                    // 更新該項目
                    let target = this.materials.find((m)=> m.idx == res.data.material.idx);
                    if (target) Object.assign(target, res.data.material);
                    
                    this.dialogTableVisible2 = false;
                    this.update.title = '';
                    this.update.fileList = [];
                    this.update.materialIdx = '';

                }
                this.$bus.$emit('handleAlert','章節更新通知',res.data.message, res.data.type)
            }
            catch(e){}
            finally{
                this.isSending2 = false;
                this.updatePercent = 0;
            }
        },
        // 更改專欄順序
        async modifyIndex(chapter, method){
            // method: up, down
            try{
                const res = await axios.put('/api/learn/modifyIndex',{
                    method, idx: this.courseIdx, materialIdx: chapter.idx
                },
                {
                    headers:{
                        'x-user-token': this.getToken()
                    }
                })
                if(res.data.type == 'success'){
                    this.materials = res.data.materials
                }
                else this.$bus.$emit('handleAlert','章節序列更新通知',res.data.message, res.data.type)
            }
            catch(e){

            }
        },
        // 刪除
        async removeChapter(chapter){
            try{

                // 防呆
                if(this.isSending3) return;
                this.isSending3 = true;

                const res = await axios.get(`/api/learn/deleteMaterial/${this.courseIdx}/${this.update.materialIdx}`,{
                    headers:{
                        'x-user-token':this.getToken()
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
        },
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
    .mobile_column_wrapper{
        display: none;
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
        min-height: 77.5px;
        height: calc((100vh - 80px)/9);
        position: relative;
        line-height: max(calc((100vh - 80px) / 9), 77.5px);
        box-sizing: border-box;
        display: flex;
        padding-left: 10px;
        align-items: center;
        transition: 1s all ease;
    }
    .list:hover{
        cursor: pointer;
        box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
    }
    .list_selected{
        background: rgba(0,0,0,0.05);
    }
    
    .list_chapter{
        width: 100px;
        font-weight: bolder;
        font-size: 16px;
    }
    .list_title{
        width: 180px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 16px;
        margin-right: 5px;
    }
    .edit{
        min-height: 77.5px;
        height: calc((100vh - 80px)/9);
        width: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .edit:hover{
        background: rgba(0,0,0,0.05);
    }
    .isDownloading{
        cursor: not-allowed;
    }
    .chapter_file_download_percent{
        font-size: 12px;
    }
    .sort{
        min-height: 77.5px;
        height: calc((100vh - 80px)/9);
        width: 30px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
    }
    .sort:hover{
        background: rgba(0,0,0,0.05);
    }
    .pen{
        margin-top: 5px;
        margin-bottom: 5px;
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

    @media screen and (max-width: 440px) {
        .view{
            width: 100vw;
        }
        .mobile_column_wrapper{
            display: block;
            width: 100%;
            height: 60px;
            position: fixed;
            top:0px;
            font-size: 16px;
            background: black;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1;
        }
        .mobile_column{
            height: 60px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            color: white;
            display: flex;
        }
        .mobile_column_currentChapter_title{
            max-width: 180px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .mobile_column:hover{
            cursor: pointer;
        }
        .mobile_column_list{
            width: 100%;
            height: auto;
            max-height: 300px;
            overflow-y: scroll;
            position: absolute;
            top:60px;
            background: black;
        }
        .mobile_column_list_item{
            width: 100%;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
        }
        .mobile_column_list_item_selected{
            background: rgba(255,255,255,0.1);

        }
        .mobile_column_list_item_chapter_box{
            display: flex;
        }
        .mobile_column_list_item_chapter{
            margin-right: 10px;
        }
        .mobile_column_list_item_title{
            width: 180px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .arrow{
            box-sizing: border-box;
            margin-left: 5px;
            transition: 0.3s rotate ease;
        }
        .rotateArrow{
            rotate: 180deg;
        }
        .sort_mobile{
            width: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .column {
            display: none;
        }
        .pdf{
            width: 100%;
            padding-left: 3px;
            padding-right: 3px;
        }
    }
</style>