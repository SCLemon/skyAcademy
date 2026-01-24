<template>
    <div>
        <div class="upload_wrapper">
            <div class="preview_item upload_item" @click="openInput()"><i class="el-icon-plus"></i></div>
            <div class="preview_item" v-for="p in uploads" :key="p.id">
                <div class="preview_mask">
                    <div class="preview_mask_item" @click="moveUploadUp(p.id)"><i class="el-icon-arrow-up"></i></div>
                    <div class="preview_mask_item" @click="moveUploadDown(p.id)"><i class="el-icon-arrow-down"></i></div>
                    <div class="preview_mask_item preview-edit" @click="showUploadImage(p.id)"><i class="el-icon-search"></i></div>
                    <div class="preview_mask_item" @click="removeUpload(p.id)"><i class="el-icon-delete"></i></div>
                </div>
                <img :src="p.url" class="preview_image"/>
            </div>
        </div>
        <input class="input" ref="input" type="file" accept="image/*" multiple @change="onUpload">
        <el-dialog title="圖片裁切" :visible.sync="isPreviewing" :before-close="saveCrop">
            <div class="crop_wrapper" ref="cropWrapper">
                <img class="crop_img" :src="currentPreviewImage.url" ref="crop_img">
                <div class="crop_box" ref="crop_box" :style="{top: cropPosition.y + 'px', aspectRatio }" @mousedown.prevent="startDragY"></div>
            </div>
        </el-dialog>
    </div>
    
</template>

<script>
import { v4 as uuidv4 } from "uuid";
export default {
    name:'UploadPicture',
    props:{
        aspectRatio:{
            type: Number,
            default: 16/9
        },
        value: { type: Array, default: () => [] }, 
    },
    computed:{
        uploads:{
            get() { return this.value; },
            set(v) { this.$emit('input', v); }
        }
    },
    data(){
        return {
            // 正在預覽的圖片
            isPreviewing: false,
            currentPreviewImage: {
                id: null, url: ''
            },

            // 裁切框的 y 偏移
            cropPosition: { x: 0, y: 0, referWidth: 0, scale: 1 },
            draggingY: false,
            dragOffsetY:0,
        }
    },
    methods:{
        // 上傳圖片
        openInput(){
            this.$refs.input.click();
        },
        onUpload(){
            const files = this.$refs.input.files;
            if(!files) return;

            const fileArr = Array.from(files).map((file) => ({
                id: uuidv4(),
                file,
                url: URL.createObjectURL(file),
                position:{
                    x:0, y:0, referWidth: 0, scale: 1,
                }
            }));

            this.uploads = [...this.uploads, ...fileArr];
            this.$refs.input.value = "";
        },

        // 調整圖片顯示順序
        moveUploadUp(id){
            const index = this.uploads.findIndex(item => item.id === id);
            if (index <= 0) return;
            [this.uploads[index - 1], this.uploads[index]] =
                [this.uploads[index], this.uploads[index - 1]];
            this.uploads = [...this.uploads];
        },

        moveUploadDown(id){
            const index = this.uploads.findIndex(item => item.id === id);
            if (index >= this.uploads.length - 1) return;
            [this.uploads[index + 1], this.uploads[index]] =
                [this.uploads[index], this.uploads[index + 1]];
            this.uploads = [...this.uploads];
        },

        // 從陣列中移除圖片
        removeUpload(id){
            const index = this.uploads.findIndex(item => item.id === id);
            const next = [...this.uploads];
            next.splice(index, 1);
            this.uploads = next;
        },

        // 顯示裁切工具
        showUploadImage(id){
            const index = this.uploads.findIndex(item => item.id === id);
            this.currentPreviewImage = {
                id, url: this.uploads[index].url
            };
            this.isPreviewing = true;
        },

        // 調整 Y offset
        startDragY(e){
            this.draggingY = true;

            const box = this.$refs.crop_box;
            this.dragOffsetY = e.clientY - box.offsetTop;

            window.addEventListener("mousemove", this.onDragMoveY);
            window.addEventListener("mouseup", this.stopDragY);
        },

        onDragMoveY(e){
            
            if(!this.draggingY) return;
            const box = this.$refs.crop_box;
            const wrapper = this.$refs.cropWrapper;

            const rect = wrapper.getBoundingClientRect();
            const boxH = box.getBoundingClientRect().height;

            const offset = Math.max(0, Math.min(e.clientY - this.dragOffsetY, rect.height - boxH));

            this.cropPosition.y = offset;
        },

        stopDragY(){
            this.draggingY = false;
            window.removeEventListener("mousemove", this.onDragMoveY);
            window.removeEventListener("mouseup", this.stopDragY);
        },

        // 儲存裁切位置
        saveCrop(done){
            this.$confirm('確認是否儲存變更?', '提示', {
                confirmButtonText: '確認',
                cancelButtonText: '不儲存',
                type: 'warning',
                distinguishCancelAndClose: true,
                customClass:'PWACSS_MessageBox'
            }).then(() => {

                // 儲存裁切資訊
                const wrapper = this.$refs.cropWrapper;
                const rect = wrapper.getBoundingClientRect();

                const next = [...this.uploads];

                const id = this.currentPreviewImage.id;
                const index = this.uploads.findIndex(item => item.id === id);

                if(index === -1){
                    done();
                    return;
                }

                next[index] = {
                    ...next[index],
                    position: {
                        x: 0,
                        y: this.cropPosition.y,
                        referWidth: rect.width,
                        scale: 1,
                    }
                };

                this.uploads = next;

                // 清除狀態
                this.currentPreviewImage = {
                    id: null, url: ''
                };
                this.cropPosition = {
                    x:0, y:0, referWidth:0, scale: 1
                };

                done();
                
            })
            .catch((action) => {
                if (action === 'cancel') {
                    // 按「不儲存」
                    this.currentPreviewImage = {
                        id: null, url: ''
                    };
                    this.cropPosition = {
                        x:0, y:0, referWidth:0
                    };
                    done();
                } 
                else if (action === 'close') {} // 按「X」
            });
        }
    }
}
</script>

<style scoped>
    .input{
        display: none;
    }
    .upload_wrapper{
        width: 100%;
        height: auto;
        display: flex;
        flex-wrap: wrap;
        padding: 9px;
        gap:9px;
        box-sizing: border-box;
    }
    .preview_item{
        width: calc(33% - 6px);
        aspect-ratio: 1 / 1;
        box-sizing: border-box;
        position: relative;
    }
    .upload_item{
        color: gray;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 0.5px dashed rgba(0,0,0,0.3);
    }
    .upload_item:hover{
        cursor: pointer;
    }
    .preview_image{
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    .preview_mask{
        width: 100%;
        aspect-ratio: 1 / 1;
        position: absolute;
        left:0;
        background: rgba(0,0,0,0.4);
        display: none;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
    }
    
    .preview_mask_item{
        display: block;
        padding: 8px;
    }
    .preview_mask_item:hover{
        cursor: pointer;
    }
    .preview_item:hover .preview_mask{
        display: flex;
    }
    /* crop */
    :deep(.el-dialog){
        width: 90vw !important;
        max-width: 750px !important;
    }
    .crop_wrapper{
        position: relative;
        width: 100%;
    }
    .crop_img{
        width: 100%;
    }
    .crop_box{
        position: absolute;
        width: 100%;
        left: 0;
        border: 2px solid #fff;
        box-sizing: border-box;
        cursor: move;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.35);
    }
    @media screen and (max-width: 440px) {
        .preview_mask_item{
            font-size: 12px;
            padding: 5px;
        }
        .preview-edit{
            display: none;
        }
    }
</style>