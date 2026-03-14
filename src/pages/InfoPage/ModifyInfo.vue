<template>
  <div>
    <div class="header">
        <span class="header_text">使用者資料維護</span>
        <div class="header_btn_wrapper">
            <subscribe class="btn" v-if="isOwnData"></subscribe>
            <el-button type="primary" class="btn" :loading="loading" icon="el-icon-refresh" @click="modifyData()">更新資料</el-button>
        </div>
    </div>
    <div class="box">
        <div class="mobile_show_changeUserIcon">
            <div class="img_block" @click.stop="openImgUpload()">
                <img class="img" :src="userInfo.userImgUrl?userInfo.userImgUrl:'img/user.png'" alt="">
                <div class="img_upload">變更頭像
                    <input type="file" @change="uploadUserImg()" class="img_upload_file" ref="img_upload_file" accept="image/*">
                </div>
            </div>
        </div>
        <div class="userInfoBox">
            <div class="user_info">
                <div class="inputBox"><div class="input_title">帳號：</div><el-input placeholder="請輸入使用者學號" disabled v-model="userInfo.account"></el-input></div>
                <div class="inputBox"><div class="input_title">姓名：</div><el-input placeholder="請輸入使用者姓名" v-model="userInfo.name"></el-input></div>
                <div class="inputBox"><div class="input_title">密碼：</div><el-input placeholder="請輸入使用者密碼" show-password v-model="userInfo.password"></el-input></div>
                <div class="inputBox"><div class="input_title">電話：</div><el-input placeholder="請輸入電話號碼" v-model="userInfo.phone"></el-input></div>
                <div class="inputBox"><div class="input_title">電子信箱：</div><el-input placeholder="請輸入電子信箱" v-model="userInfo.mailAddress"></el-input></div>
                <div class="inputBox"><div class="input_title">住家地址：</div><el-input placeholder="請輸入住家地址" v-model="userInfo.address"></el-input></div>
            </div>
            <div class="user_img_box">
                <div class="user_img" @click="openFile()">
                    <img :src="userInfo.userPhotoStickerUrl" alt="">
                    <div class="uploadImgBtn">點擊上傳</div>
                </div>
                <input type="file" class="imgFile" ref="imgFile" @change="handleChangeFile()" accept="image/*">
            </div>
        </div>
        <div class="id_card_box">
            <div class="id_card  id_card_forward" ref="forward">
                <div class="id_card_forward_top"><img src="img/horizontal_logo.png" alt=""></div>
                <div class="id_card_forward_name_title">姓名/Name</div>
                <div class="id_card_forward_name">{{ userInfo.name }}</div>
                <div class="id_card_forward_id_title">證號/{{ userInfo.type=='teacher'?'Admin':'Member' }} ID</div>
                <div class="id_card_forward_id">{{userInfo.account}}</div>
                <div class="id_card_forward_imgBox"><img :src="userInfo.userPhotoStickerUrl" alt=""></div>
                <div class="id_card_forward_barcode">
                    <svg ref="barcode"></svg>
                </div>
                <div class="id_card_forward_type_box">
                    <div class="id_card_forward_type">{{userInfo.level? userInfo.level.levelTitle:''}}</div>
                    <div class="id_card_forward_type_eng">{{ userInfo.type=='teacher'?'Admin':'Member' }}  ID Card</div>
                </div>
            </div>
            <div class="id_card id_card_backward" ref="backward">
                <div class="id_card_backward_top">
                    <div class="id_card_backward_mail">管理員服務信箱：blc0000421@gmail.com</div>
                     <div class="id_card_backward_level">{{userInfo.level? userInfo.level.levelTitle:''}}卡 ▶</div>
                </div>
                <div class="id_card_backward_liner"></div>
                <div class="id_card_signature_box">
                    <div class="id_card_signature_title">持卡人簽名：</div>
                    <div class="id_card_signature"></div>
                </div>
                <div class="id_card_declaration_box">
                    <div class="id_card_declaration_title">持卡人須知：</div>
                    <div class="id_card_declaration">1. 會員卡為個人專屬，僅限本人使用，不得轉讓、出借或轉售。</div>
                    <div class="id_card_declaration">2. 持卡人應妥善保管會員卡，如有遺失、被盜，請立即通知管理員辦理掛失或補發。</div>
                    <div class="id_card_declaration">3. 本網站保留變更、暫停或終止會員制度之權利，並依實際情況公告於本網站。</div>
                    <div class="id_card_declaration">4. 使用會員卡即表示同意本網站使用須知及相關隱私政策。</div>
                    <div class="id_card_declaration">5. 若會員有不當使用或違反規定，本網站得取消其會員資格與相關權益。</div>
                    <div class="id_card_declaration">6. 任何爭議依中華民國法律處理，並以本網站所在地法院為第一審管轄法院。</div>
                </div>
                <div class="id_card_issuer">Copyright © 2026 Lemon's Universe All Rights Reserved</div>
            </div>
            <div class="id_card_download">
                <div class="level" v-if="enableModifyLevel()">
                    <div class="manageLevelTitle">調整會員等級</div>
                    <el-select v-model="userInfo.level.level" placeholder="請選擇等級">
                        <el-option v-for="(item,id) in levelTitleArray" :key="id" :label="`Lv${id+1} ${item}`" :value="id+1"></el-option>
                    </el-select>
                </div>
                <div><el-button class="download_btn" type="primary" @click="downloadForward()">下載卡片正面</el-button></div>
                <div><el-button class="download_btn" type="primary" @click="downloadBackward()">下載卡片背面</el-button></div>
            </div>
        </div>
        <div class="mobile_show">
            <div class="mobile_level">
                <div class="level" v-if="enableModifyLevel()">
                    <div class="manageLevelTitle">會員等級：</div>
                    <el-select v-model="userInfo.level.level" placeholder="請選擇等級">
                        <el-option v-for="(item,id) in levelTitleArray" :key="id" :label="`Lv${id+1} ${item}`" :value="id+1"></el-option>
                    </el-select>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsCookie from 'js-cookie';
import JsBarcode from "jsbarcode";
import html2canvas from 'html2canvas';
import Subscribe from './components/Subscribe.vue';
export default {
    name:'ModifyStudentInfo',
    components:{
        Subscribe
    },
    data(){
        return {
            loading: false,
            idx:'',
            isOwnData: false,
            // 上傳圖片的 file
            file:{},
            userInfo:{
                idx:'',
                type:'',
                token:'',
                account:'',
                name:'',
                password:'',
                phone:'',
                mailAddress:'',
                address:'',
                level:{
                    level:1,
                    levelTitle:'新手會員'
                },
                userImgUrl:'',
                userPhotoStickerUrl:'',
            },
            levelTitleArray:[],
        }
    },
    async mounted(){
        let idx = this.$route.query.idx;
        if(!idx){
            this.$bus.$emit('handleAlert','使用者資料維護通知','參數不可為空','error')
            return
        }
        this.idx = idx;
        await this.getData();
        this.isOwnData = JSON.parse(localStorage.getItem('currentUser')).idx == this.idx;
    },
    methods:{
        async getData(){
            const token = jsCookie.get('authToken')
            const res = await axios.get(`/api/userInfo/getUserInfo/${this.idx}`,{
                headers:{
                    'x-user-token':token
                }
            })
            if(res.data.type == 'success'){
                res.data.user.userImgUrl += `?${new Date().getTime()}`
                res.data.user.userPhotoStickerUrl += `?${new Date().getTime()}`
                this.userInfo = res.data.user
                this.levelTitleArray = res.data.levelTitleArray
                this.$bus.$emit('updateCurrentUser')
                this.generateBarcode()
            }
            else this.$bus.$emit('handleAlert','使用者資料獲取通知',res.data.message,res.data.type)
        },
        async modifyData(){
            this.loading = true;
            let formData = new FormData();
            formData.append('userInfo',JSON.stringify(this.userInfo));
            formData.append('attachments',this.file)
            try{
                const token = jsCookie.get('authToken')
                const res = await axios.post(`/api/userInfo/modifyUserInfo/${this.idx}`,formData,{
                    headers:{
                        'x-user-token':token
                    }
                })
                if(res.data.type == 'success'){
                    this.$refs['imgFile'].value = '';
                    this.getData();
                    this.$bus.$emit('handleAlert','使用者資料更新通知',res.data.message,res.data.type)
                }
                else this.$bus.$emit('handleAlert','使用者資料更新通知',res.data.message,res.data.type)
            }
            catch(e){}
            finally{
                this.loading = false;
            }
        },
        generateBarcode() {
            const token = this.userInfo.idx;
            JsBarcode(this.$refs.barcode, token, {
                format: "CODE128",
                displayValue: true,
                lineColor: "black",
                background: "transparent",
                width: 2,
                height: 100,
                textMargin:20
            });
        },
        openFile(){
            this.$refs['imgFile'].click();
        },
        handleChangeFile(){
            let file = this.$refs['imgFile'].files[0]
            if (file) {
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.userInfo.userPhotoStickerUrl= reader.result;
                };
                this.file = file;
            }
        },
        downloadForward(){
            const targetDiv = this.$refs.forward;
            html2canvas(targetDiv, {
                scale: 10,
                useCORS: true 
            }).then(canvas => {
                const token = this.userInfo.token;
                this.writeTokenAtHead(canvas, token);

                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png",1.0);
                link.download = `${this.userInfo.name}_forward.png`;
                link.click();
            });
        },
        downloadBackward(){
            const targetDiv = this.$refs.backward;
            html2canvas(targetDiv, {
                scale: 10,
                useCORS: true
            }).then(canvas => {
                const token = this.userInfo.token;
                this.writeTokenAtHead(canvas, token);

                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png", 1.0);
                link.download =`${this.userInfo.name}_backward.png`;
                link.click();
            });
        },
        // 添加 token 到電子識別證
        writeTokenAtHead(canvas, token) {
            const ctx = canvas.getContext('2d');
            const { width, height } = canvas;
            const img = ctx.getImageData(0, 0, width, height);
            const data = img.data;

            const enc = new TextEncoder();
            const msg = enc.encode(token);

            const payload = new Uint8Array(2 + msg.length);
            new DataView(payload.buffer).setUint16(0, msg.length, true);
            payload.set(msg, 2);

            const needBits = payload.length * 8;
            const capacityBits = width * height;
            if (needBits > capacityBits) {
                throw new Error(`圖片不夠大，容量=${Math.floor(capacityBits/8)} bytes，需=${payload.length} bytes`);
            }

            for (let bit = 0; bit < needBits; bit++) {
                const byte = payload[bit >> 3];
                const b = (byte >> (bit & 7)) & 1;
                const px = bit * 4;
                data[px + 2] = (data[px + 2] & 0xFE) | b;
            }

            ctx.putImageData(img, 0, 0);
        },
        enableModifyLevel(){
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            return currentUser && currentUser.typeEng === 'teacher';
        },
        
        // 移動端更改顯示頭像
        openImgUpload(){
            let el = this.$refs['img_upload_file'];
            el.click();
        },
        async uploadUserImg(){
            try{
                const token = jsCookie.get('authToken')

                let el = this.$refs['img_upload_file'];
                let file = el.files[0];
                if (!file) return;

                await this.$confirm(`確認修改頭貼?`, '提示', {
                    confirmButtonText: '確認',
                    cancelButtonText: '取消',
                    type: 'warning',
                    customClass:'PWACSS_MessageBox'
                })
                let formData = new FormData();
                formData.append("attachments", file);

                const res = await axios.post("/api/userInfo/updateIcon", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "x-user-token": token,
                    },
                })
                if(res.data.type == 'success'){
                    await this.getData();
                    this.$bus.$emit('setUserInfo')
                    this.$bus.$emit('handleAlert','頭像上傳通知',res.data.message,res.data.type)
                }
                else this.$bus.$emit('handleAlert','頭像上傳通知',res.data.message,res.data.type)
            }
            catch(e){
                console.log(e)
            }
            finally{
                this.$refs['img_upload_file'].value = '';
            }
        },
    }
}
</script>

<style scoped>
    .header{
        height: 80px;
        width: 95%;
        line-height: 80px;
        font-size: 24px;
        margin: 0 auto;
        padding-left: 10px;
        border-bottom: 1px solid rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
    }
    .header_btn_wrapper{
        margin-left: auto;
    }
    .btn{
        height: 40px;
        margin-left: 8px;
    }
    .box{
        width: 95%;
        margin: 0 auto;
        margin-top: 10px;
        height: calc(100vh - 120px);
        box-sizing: border-box;
    }
    .mobile_show_changeUserIcon{
        display: none;
    }
    .userInfoBox{
        width: 100%;
        height: 370px;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }
    .user_info{
        width: 80%;
        height: 370px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding-left: 10px;
        padding-right: 20px;
        box-sizing: border-box;
    }
    .inputBox{
        display: flex;
    }
    .input_title{
        height: 40px;
        line-height: 40px;
        width: 100px;
    }
    .user_img_box{
        width: 20%;
        height: 370px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
    }
    .user_img{
        width: 220px;
        height: 282.86px;
        border: 1px solid rgba(0,0,0,0.1);
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        overflow: hidden;
    }
    .user_img:hover{
        cursor: pointer;
    }
    .user_img>img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .imgFile{
        display: none;
    }
    .uploadImgBtn{
        width: 100%;
        height: 40px;
        position: absolute;
        left: 0;
        bottom: -40px;
        text-align: center;
        line-height: 40px;
        color: white;
        transition: bottom 1s;
    }
    .user_img:hover .uploadImgBtn{
        bottom:0;
        background-color: rgba(0,0,0,0.5);
    }
    .id_card_box{
        width: 100%;
        height: 280px;
        margin: 0 auto;
        margin-top: 10px;
        display: flex;
        align-items: center;
    }
    .id_card{
        width: 412.3px !important;
        height: 260px !important;
        background: white;
        border-radius: 15px;
        box-sizing: border-box;
        margin-left: 25px;
        border: 1px solid rgba(0,0,0,0.1);
        position: relative;
        color: black;
    }
    .id_card_forward{
        background-image: url(../../../public/logo_black.png);
        background-size: 150px;
        background-position: center;
        background-repeat: no-repeat;
    }
    .id_card_forward_top{
        position: absolute;
        top:8px;
        left: 16px;
        width: 190px;
        z-index: 1;
    }
    .id_card_forward_top>img{
        width: 100%;
        height: 100%;
        z-index: 1;
    }
    .id_card_forward_name_title{
        position: absolute;
        left:20px;
        top:75px;
        font-size: 14px;
        z-index: 1;
    }
    .id_card_forward_name{
        position: absolute;
        left:20px;
        top:105px;
        font-size: 14px;
        z-index: 1;
    }
    .id_card_forward_id_title{
        position: absolute;
        left:20px;
        top:135px;
        font-size: 14px;
        z-index: 1;
    }
    .id_card_forward_id{
        position: absolute;
        left:20px;
        top:165px;
        font-size: 14px;
        z-index: 1;
    }
    .id_card_forward_imgBox{
        width: 100px;
        height: 128.57px;
        position: absolute;
        right: 28px;
        top:65px;
        z-index: 1;
    }
    .id_card_forward_imgBox>img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .id_card_forward_barcode{
        width: 250px;
        position: absolute;
        left:15px;
        bottom: 7px;
        z-index: 1;
    }
    .id_card_forward_barcode>svg{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .id_card_forward_type_box{
        position: absolute;
        right:28px;
        bottom: 18px;
        font-size: 14px;
        z-index: 1;
        height: auto;
        width: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .id_card_forward_type{
        font-size: 14px;
        z-index: 1;
        line-height: 1.5;
        font-weight: bolder;
    }
    .id_card_forward_type_eng{
        font-size: 12px;
        z-index: 1;
        line-height: 1.5;
    }
    .id_card_foward_center_logo{
        width: 150px;
        height: 150px;
        position: absolute;
        left: 0;
        top:0;
        right: 0;
        bottom: 0;
        margin: auto;
        background-image: url(../../../public/logo.png);
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        filter: opacity(20%) grayscale(100%);
        z-index: 0;
        border: 1px solid red;
    }
    .id_card_backward{
        position: relative;
        background: white;
    }
    .id_card_backward_top{
        width: 100%;
        height: 30px;
        line-height: 30px;
        font-size: 10px;
        padding-left: 9.5px;
        display: flex;
        justify-content: space-between;
    }
    .id_card_backward_level{
        margin-right: 17.5px;
    }
    .id_card_backward_liner{
        position: sticky;
        left: 0;
        top: 30px;
        width: 100%;
        height: 40px;
        background: #d9d9d9;
        box-sizing: border-box;
    }
    .id_card_signature_box{
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        font-size: 10px;
        line-height: 40px;
        padding-left: 10px;
        display: flex;
        align-items: center;
    }
    .id_card_signature{
        width: 180px;
        border-bottom: 0.5px solid rgba(0,0,0,0.3);
        height: 24px;
        margin-left: 5px;
    }
    .id_card_declaration_box{
        width: 100%;
        font-size: 10px;
        margin-left: 10px;
    }
    .id_card_declaration_title{
        margin-bottom: 8px;
    }
    .id_card_declaration{
        line-height: 1.55;
        margin-top: 2px;
        margin-bottom: 2px;
    }
    .id_card_issuer{
        font-size: 9px;
        width: 100%;
        text-align: center;
        position: absolute;
        bottom:8.5px;
        color: rgba(0,0,0,0.3);
    }
    .id_card_download{
        width:226.09px;
        height: 260px;
        margin-left: 28px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .level{
        height: 100px;
    }
    .manageLevelTitle{
        line-height: 2;
        margin-bottom: 5px;
    }
    .download_btn{
        margin-top: 15px;
    }
    .mobile_show{
        display: none;
    }
    @media screen and (max-width: 440px) {
        .box{
            overflow-y: scroll;
            padding-bottom: 85px;
        }
        .header{
            border-bottom: 0;
        }
        .header_btn_wrapper{
            margin-right: 10px;
        }
        .header_text{
            display: none;
        }
        .mobile_show_changeUserIcon{
            display: block;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            padding-top: 15px;
            padding-bottom: 15px;
        }
        .img_block{
            width: 150px;
            height: 150px;
            background: white;
            border-radius: 150px;
            overflow: hidden;
            position: relative;
            margin-left: 10px;
        }
        .img{
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .img_upload{
            position: absolute;
            width: 100%;
            height: 38px;
            line-height: 38px;
            color: white;
            font-size: 13px;
            text-align: center;
            background-color: rgba(0,0,0,0.5);
            left: 0;
            bottom: -38px;
            transition: bottom 0.75s;
        }
        .img_block:hover{
            cursor: pointer;
        }
        .img_block:hover .img_upload{
            bottom: 0;
        }
        .img_upload_file{
            display: none;
        }
        .mobile_show{
            display: block;
        }
        .user_img_box{
            display: none;
        }
        .user_info{
            width: 100%;
            padding-left: 5px;
            padding-right: 5px;
            margin: 0 auto;
        }
        .input_title{
            width: 110px;
        }
        .id_card_box{
            display: none;
        }
        .mobile_level{
            width:100%;
            padding-left: 5px;
            display: flex;
            margin: 0 auto;
        }
        .manageLevelTitle{
            width: 110px;
        }
        .inputBox :deep(.el-input){
            width: calc(100% - 110px);
        }
        .level{
            width: 100%;
            height: auto;
            display: flex;
            align-items: center;
        }
    }
</style>