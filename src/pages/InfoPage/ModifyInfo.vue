<template>
  <div>
    <div class="header">使用者資料維護
        <el-button type="primary" class="btn" :loading="loading" @click="modifyData()">更新資料</el-button>
    </div>
    <div class="box">
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
                    <img :src="userInfo.userImgUrl" alt="">
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
                <div class="id_card_forward_imgBox"><img :src="userInfo.userImgUrl" alt=""></div>
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
                <div class="id_card_issuer">Copyright © 2025 Lemon's Universe All Rights Reserved</div>
            </div>
            <div class="id_card_download">
                <div class="level">
                    <div class="manageLevelTitle">調整會員等級</div>
                    <el-select v-model="userInfo.level.level" placeholder="請選擇等級">
                        <el-option v-for="(item,id) in levelTitleArray" :key="id" :label="`Lv${id+1} ${item}`" :value="id+1"></el-option>
                    </el-select>
                </div>
                <div><el-button class="download_btn" type="primary" @click="downloadForward()">下載卡片正面</el-button></div>
                <div><el-button class="download_btn" type="primary" @click="downloadBackward()">下載卡片背面</el-button></div>
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
export default {
    name:'ModifyStudentInfo',

    data(){
        return {
            loading: false,
            idx:'',

            // 上傳圖片的 file
            file:{},
            userInfo:{
                idx:'',
                type:'',
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
                userImgUrl:''
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
            const token = jsCookie.get('authToken')
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
                    this.userInfo.userImgUrl = reader.result;
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
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "forward.png";
                link.click();
            });
        },
        downloadBackward(){
            const targetDiv = this.$refs.backward;
            html2canvas(targetDiv, {
                scale: 10,
                useCORS: true
            }).then(canvas => {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "backward.png";
                link.click();
            });
        }
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
    .btn{
        height: 40px;
        margin-left: auto;
        margin-right: 5px;
    }
    .box{
        width: 95%;
        margin: 0 auto;
        margin-top: 10px;
        height: calc(100vh - 120px);
        box-sizing: border-box;
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
        top:10px;
        left: 10px;
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
</style>