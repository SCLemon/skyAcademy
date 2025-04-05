<template>
  <div class="view">
    <div class="videoBox">
        <div class="video"  v-if="showMaterial">
            <iframe width="860" height="483.75"
                :src="currentMaterial.videoSrc"
                title="YouTube video player" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
            </iframe>
            <div class="title">{{ currentMaterial.title }}</div>
            <div class="abstract">{{ currentMaterial.abstract }}</div>
            <div class="attachmentBox">
                教材檔案下載： <a :href="currentMaterial.attachmentUrl" class="downloadLink">點擊下載</a>
            </div>
        </div>
        <div class="video_empty" v-else>
            <el-empty description="目前本課程暫無上課教材"></el-empty>
        </div>
        <div class="videoList">
            <div class="videoList_title">
                <div>上課教材</div>
                <div class="video_add_btn" @click="dialogTableVisible=true"><el-button type="primary">上傳<i class="el-icon-upload el-icon--right"></i></el-button></div>
            </div>
            <div class="videoList_item_box">
                <div :class="`videoList_item ${selectedItem === obj.idx?'videoList_item_checked':''}`" v-for="(obj,id) in material" :key="id" @click="openMaterial(obj)">{{ obj.title }} <i class="fa-solid fa-pen pen"></i></div>
            </div>
        </div>
    </div>
    <el-dialog title="上傳教材" :visible.sync="dialogTableVisible">
       <div class="uploadTitle">影片標題</div>
       <el-input v-model="form.title" placeholder="請輸入影片標題" clearable=""></el-input>
       <div class="uploadTitle">影片簡介</div>
       <el-input v-model="form.abstract" placeholder="請輸入影片簡介" clearable=""></el-input>
       <div class="uploadTitle">影片連結</div>
       <el-input v-model="form.videoSrc" placeholder="請先將影片上傳至 Youtube 並設置為不公開，而後將內嵌 <iframe> 中的 src 貼至此處。" clearable=""></el-input>
       <div class="uploadTitle">教材上傳</div>
       <el-upload
            class="upload-demo" action="#" :auto-upload="false" drag multiple :on-change="handleChange" :file-list="form.fileList" accept="application/*, image/*">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">將文件拖到此處，或<em>點擊上傳</em></div>
        </el-upload>
        <el-button type="primary" class="materialBtn" :loading="addLoading" @click="addMaterial()">確認上傳教材</el-button>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import jsCookie from 'js-cookie';
export default {
    name:'Class',
    data(){
        return {
            courseIdx:this.$route.query.idx,
            selectedItem:null,
            // 教材列表
            material:[],

            // 顯示影片與教材
            showMaterial:false,
            currentMaterial:{

            },
            // 教材上傳
            addLoading:false,
            dialogTableVisible:false,
            form:{
                title:'',
                abstract:'',
                videoSrc:'',
                fileList:[],
            },
        }
    },
    async mounted(){
        await this.getData();
    },
    methods:{
        async getData(){
            const token = jsCookie.get('authToken');
            const res = await axios.get(`/api/learn/getCourserMaterial/${this.courseIdx}`,{
                headers:{
                    'x-user-token':token
                }
            });
            if(res.data.type == 'success'){
                if(res.data.material == 0) this.showMaterial = false;
                else {
                    this.material = res.data.material
                    this.currentMaterial = this.material[0];
                    this.selectedItem = this.currentMaterial.idx;
                    this.showMaterial = true;
                }
            }
            else this.$bus.$emit('handleAlert','課程教材獲取通知', res.data.message, res.data.type)
        },
        async addMaterial(){
            this.addLoading = true;
            try{
                const token = jsCookie.get('authToken');

                let formData = new FormData();
                formData.append('idx',this.courseIdx);
                formData.append('title',this.form.title)
                formData.append('abstract', this.form.abstract)
                formData.append('videoSrc', this.form.videoSrc)

                console.log(this.form.fileList)
                this.form.fileList.forEach(file => {
                    formData.append('attachments', file.raw);
                });

                const res = await axios.post(`/api/learn/createMaterial`,formData,{
                    headers:{
                        'x-user-token':token
                    }
                });
                if(res.data.type == 'success'){
                    this.getData();
                    this.dialogTableVisible = false
                    this.form = {
                        idx:'',
                        title:'',
                        abstract:'',
                        videoSrc:'',
                        fileList:[],
                    }
                    this.$bus.$emit('handleAlert','課程教材獲取通知', res.data.message, res.data.type)
                }
                else this.$bus.$emit('handleAlert','課程教材獲取通知', res.data.message, res.data.type)
            }
            catch(e){
                console.log(e)
            }
            finally{
                this.addLoading = false;
            }
        },

        handleChange(file,fileList){
            this.form.fileList = fileList
        },

        openMaterial(material){
            this.selectedItem = material.idx;
            this.currentMaterial = material
        }
    }
}
</script>

<style scoped>
    .view{
        width: calc(100vw - 250px);
        height: 100vh;
    }
    .videoBox{
        width: 100%;
        height: 100vh;
        box-sizing: border-box;
        padding-top: 15px;
        display: flex;
        justify-content: space-evenly;
    }
    .video{
        width: 860px;
        height: 483.75px;
    }
    .video_empty{
        width: 860px;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .title{
        width: 100%;
        height: 60px;
        line-height: 60px;
        font-weight: bolder;
        font-size: 18px;
        box-sizing: border-box;
        white-space: nowrap;       
        overflow: hidden;           
        text-overflow: ellipsis; 
    }
    .abstract{
        width: 100%;
        height: auto;
        font-size: 14px;
        line-height: 1.5;
        max-height: 157px;
        overflow-y: scroll;
        margin-bottom: 20px;
        background: rgba(0,0,0,0.05);
        box-sizing: border-box;
        border-radius: 5px;
        padding: 5px;
    }
    .downloadLink{
        text-decoration: none;
        color: blue;
    }
    .downloadLink:hover{
        text-decoration: underline;
    }
    .videoList{
        width: 280px;
        height: 100%;
        box-sizing: border-box;
        overflow-y: scroll;
    }
    .videoList_title{
        width: 95%;
        height: 60px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        padding-left: 10px;
        padding-right: 10px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    .video_add_btn{
        margin-left: auto;
    }
    .videoList_item_box{
        width: 100%;
        height: calc(100% - 60px);
        overflow-y: scroll;
    }
    .videoList_item{
        width: 95%;
        height: 60px;
        line-height: 60px;
        margin: 0 auto;
        padding-left: 10px;
        padding-right: 10px;
        white-space: nowrap;       
        overflow: hidden;           
        text-overflow: ellipsis;  
        box-sizing: border-box;  
        position: relative;
    }
    .videoList_item:hover{
        cursor: pointer;
        background: black;
        color: white;
    }
    .videoList_item_checked{
        background: black;
        color: white;
    }
    .pen{
        position: absolute;
        top:5px;
        right:5px;
        font-size: 10px;
    }
    .pen:hover{
        cursor: pointer;
    }
    ::v-deep .el-dialog{
        min-width: 720px;
    }
    ::v-deep .el-upload-dragger{
        width: 680px;
    }
    .uploadTitle{
        height: 30px;
        line-height: 30px;
    }
    .materialBtn{
        width: 100%;
        margin-top: 15px;
    }
</style>