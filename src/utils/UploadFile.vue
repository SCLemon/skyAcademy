<template>
    <div>
        <div class="uploadBox" :style="{ aspectRatio }" @click="openInput()">
            <div class="uploadIconBox">
                <div class="upload_icon"><i class="el-icon-upload"></i></div>
                <div class="upload_text">點擊上傳文件</div>
            </div>
        </div>
        <div class="uploadListBox" v-if="uploads.length > 0">
            <div class="uploadList" v-for="item in uploads" :key="item.id" @click="removeUpload(item.id)">
                <i class="el-icon-document uploadList_fileIcon"></i>
                <div class="uploadList_filename">{{ item.file.name }}</div>
                <i class="el-icon-close uploadList_removeIcon"></i>
            </div>
        </div>
        <input type="file" ref="fileInput" class="fileInput" :multiple="multiple" :accept="accept" @change="onUpload()">
    </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
export default {
    name: 'UploadFile',
    props:{
        aspectRatio:{
            type: Number,
            default: 16/9
        },
        accept:{
            type: String,
            default: ".pdf"
        },
        multiple:{
            type: Boolean,
            default: false
        },
        value: { type: Array, default: () => [] }, 
    },
    computed:{
        uploads:{
            get() { return this.value; },
            set(v) { this.$emit('input', v); }
        },
    },
    methods:{
        openInput(){
            this.$refs.fileInput.click();
        },
        onUpload(){
            const files = this.$refs.fileInput.files;
            if(!files) return;

            if(!this.multiple && this.uploads.length >= 1) {
                this.$bus.$emit('handleAlert','文件上傳通知', '僅限上傳一份文件','warning');
                this.$refs.fileInput.value = "";
                return;
            }

            const fileArr = Array.from(files).map((file) => ({
                id: uuidv4(), file
            }));

            this.uploads = [...this.uploads, ...fileArr];
            this.$refs.fileInput.value = "";
        },
        removeUpload(id){
            this.$confirm('確認是否刪除文件?', '提示', {
                confirmButtonText: '確認',
                cancelButtonText: '取消',
                type: 'warning',
                distinguishCancelAndClose: true,
                customClass:'PWACSS_MessageBox'
            }).then(()=>{
                const index = this.uploads.findIndex(item => item.id === id);
                const next = [...this.uploads];
                next.splice(index, 1);
                this.uploads = next;
            }).catch(()=>{})
        },
    }
}
</script>

<style scoped>
    .uploadBox{
        width: 100%;
        border: 1px dashed rgb(217, 217, 217);
        border-radius: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.3s ease;
    }
    .uploadIconBox{
        color: rgb(192, 196, 204);
        transition: all 0.3s ease;
    }
    .upload_icon{
        text-align: center;
        font-size: 60px;
    }
    .upload_text{
        margin-top: 5px;
    }
    .uploadBox:hover{
        cursor: pointer;
        border: 1px dashed rgba(0,0,0,0.6);
    }
    .uploadBox:hover .uploadIconBox{
        color: rgba(0,0,0,0.6);
    }

    .uploadListBox{
        margin-top: 10px;
        width: 100%;
    }
    .uploadList{
        width: 100%;
        height: 25px;
        display: flex;
        align-items: center;
        color: rgba(0,0,0,0.5);
        transition: 0.6s all ease;
        
    }
    .uploadList:hover{
        cursor: pointer;
        color: rgba(0,0,0,0.7);
        background: rgba(0,0,0,0.05);
    }
    .uploadList_fileIcon{
        width: 25px;
        height: 25px;
        text-align: center;
        line-height: 25px;
        margin-right: 5px;
    }
    .uploadList_filename{
        width: calc(100% - 60px);
        line-height: 25px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .uploadList_removeIcon{
        width: 25px;
        height: 25px;
        text-align: center;
        line-height: 25px;
        margin-left: auto;
    }
    .fileInput{
        display: none;
    }
    @media screen and (max-width: 440px){
        .upload_icon{
            text-align: center;
            font-size: 28px;
        }
        .upload_text{
            font-size: 12px;
        }
    }
</style>