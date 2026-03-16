<template>
    <div>
        <div class="upload_wrapper">
            <div class="preview_item upload_item" @click="openInput()" :style="{ aspectRatio }"><i class="el-icon-plus"></i></div>
            <div class="preview_item" v-for="p in uploads" :key="p.id" :style="{ aspectRatio }">
                <div class="preview_mask" :style="{ aspectRatio }">
                    <div class="preview_mask_item" @click="moveUploadUp(p.id)"><i class="el-icon-arrow-up"></i></div>
                    <div class="preview_mask_item" @click="moveUploadDown(p.id)"><i class="el-icon-arrow-down"></i></div>
                    <div class="preview_mask_item preview-edit" v-if="cropEnabled" @click="showUploadImage(p.id)"><i class="el-icon-search"></i></div>
                    <div class="preview_mask_item" @click="removeUpload(p.id)"><i class="el-icon-delete"></i></div>
                </div>
                <img :src="p.url" class="preview_image"/>
            </div>
        </div>
        <input class="input" ref="input" type="file" accept="image/*" multiple @change="onUpload()">
        <el-dialog title="圖片呈現位置" :visible.sync="isPreviewing" :before-close="saveCrop">
            <div class="crop_wrapper" ref="cropWrapper" :style="{ aspectRatio }">
                <img class="crop_img" :src="currentPreviewImage.url" ref="crop_img" :style="cropStyle">
            </div>
              <div class="crop_controls" style="margin-top: 10px;">
                <div class="crop_controls_item">
                    <div class="crop_controls_item_title">水平偏移量（px）： </div>
                    <div class="crop_controls_item_input"><el-input-number size="medium" v-model="cropPosition.x" :step="1"></el-input-number></div>
                </div>
                <div class="crop_controls_item">
                    <div class="crop_controls_item_title">垂直偏移量（px）： </div>
                    <div class="crop_controls_item_input"><el-input-number size="medium" v-model="cropPosition.y" :step="1"></el-input-number></div>
                    
                </div>
                <div class="crop_controls_item">
                    <div class="crop_controls_item_title">放大倍率：</div>
                    <div class="crop_controls_item_input"><el-slider v-model="cropPosition.scale" :min="0.5" :max="3" :step="0.01" :show-tooltip="true"/></div>
                    
                </div >
            </div>
        </el-dialog>
    </div>
    
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import { compressImage } from "./js/compressor";
export default {
    name:'UploadPicture',
    props:{
        aspectRatio:{
            type: Number,
            default: 16/9
        },
        cropEnabled:{
            type: Boolean,
            default: true,
        },
        maxSize:{
            type: Number,
            default: 1440,
        },
        value: { type: Array, default: () => [] }, 
    },
    computed:{
        uploads:{
            get() { return this.value; },
            set(v) { this.$emit('input', v); }
        },
        cropStyle(){
            return {
                transform: `translate(${-this.cropPosition.x}px, ${-this.cropPosition.y}px) scale(${this.cropPosition.scale})`,
            }
        },
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

            // 縮放比例限制
            minScale: 1,
        }
    },
    methods:{
        // 上傳圖片
        openInput(){
            this.$refs.input.click();
        },
        async onUpload(){
            const files = this.$refs.input.files;
            if(!files) return;

            const fileArr = Array.from(files).map((file) => ({
                id: uuidv4(),
                file,
                url: URL.createObjectURL(file),
                position:{
                    x:0, y:0, referWidth: 0, scale: 1,
                },
            }));

            await Promise.all(
                fileArr.map(async (file) => {

                    const originalSize = file.file.size;

                    try{
                        const compressedFile = await compressImage(file.file, this.maxSize);
                        file.file = compressedFile;

                        const compressedSize = compressedFile.size;

                        console.log(`原始: ${(originalSize / 1024).toFixed(1)} KB → 壓縮後: ${(compressedSize / 1024).toFixed(1)} KB`);
                    }
                    catch{
                        console.log(file.file, '壓縮失敗');
                    }

                })
            );

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
            this.$confirm('確認是否刪除圖片?', '提示', {
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

        // 顯示裁切工具
        showUploadImage(id){
            const index = this.uploads.findIndex(item => item.id === id);
            if(index === -1) return;

            this.currentPreviewImage = {
                id, url: this.uploads[index].url
            };
            this.cropPosition = this.uploads[index].position
                                    ? { ...this.uploads[index].position } : { x: 0, y: 0, referWidth: 0, scale: 1 };

            this.isPreviewing = true;

            this.$nextTick(()=>{ // 校正參數
                if(this.cropPosition.referWidth != 0){
                    const wrapper = this.$refs.cropWrapper;
                    const rect = wrapper.getBoundingClientRect();
                    const factor = rect.width / this.cropPosition.referWidth;
                    
                    this.cropPosition.x = (this.cropPosition.x ?? 0) * factor;
                    this.cropPosition.y = (this.cropPosition.y ?? 0) * factor;
                }
            })
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
                        x: this.cropPosition.x,
                        y: this.cropPosition.y,
                        referWidth: rect.width,
                        scale: this.cropPosition.scale,
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
                this.minScale = 1;

                done();
                
            })
            .catch((action) => {
                if (action === 'cancel') {
                    // 按「不儲存」
                    this.currentPreviewImage = {
                        id: null, url: ''
                    };
                    this.cropPosition = {
                        x:0, y:0, referWidth:0, scale: 1
                    };
                    this.minScale = 1;
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
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
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
        display: block;
    }
    .preview_mask{
        width: 100%;
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
        overflow: hidden;
        box-sizing: border-box;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.35);
        background: black;
    }
    .crop_img{
        width: 100%;
        position: absolute;
        transform-origin: top left;
    }
    .crop_box{
        position: absolute;
        width: 100%;
        left: 0;
        box-sizing: border-box;
        cursor: move;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.35);
    }
    .crop_controls_item{
        margin-top: 10px;
        height: 40px;
        display: flex;
        justify-content: space-evenly;
    }
    .crop_controls_item_title{
        width: 150px;
        line-height: 40px;
    }
    .crop_controls_item_input{
        width: calc(100% - 150px);
    }
    @media screen and (max-width: 440px) {
        .preview_item{
            width: calc(50% - 9px);
        }
        .preview_mask{
            flex-wrap: wrap;
            padding: 10px;
            box-sizing: border-box;
        }
        .preview_mask_item{
            width: 25%;
            box-sizing: border-box;
            display: flex;
            aspect-ratio: 1/1;
            justify-content: center;
            align-items: center;
        }
        :deep(.el-input-number--medium){
            width: 100%;
        }
    }
</style>