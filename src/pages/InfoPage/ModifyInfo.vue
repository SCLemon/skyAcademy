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
                <div class="id_card_forward_id_title">證號/{{ userInfo.type=='teacher'?'Admin':'User' }} ID</div>
                <div class="id_card_forward_id">{{userInfo.account}}</div>
                <div class="id_card_forward_imgBox"><img :src="userInfo.userImgUrl" alt=""></div>
                <div class="id_card_forward_barcode">
                    <svg ref="barcode"></svg>
                </div>
                <div class="id_card_forward_type_box">
                    <div class="id_card_forward_type">{{userInfo.type=='teacher'?'管理員':'訂閱者'}}證</div>
                    <div class="id_card_forward_type_eng">{{ userInfo.type=='teacher'?'Admin':'User' }}  ID Card</div>
                </div>
                <!-- <div class="id_card_foward_center_logo" ref="logo"></div> -->
            </div>
            <div class="id_card id_card_backward" ref="backward">
                <div class="id_card_backward_center">
                    <div class="id_card_backward_center_first">Knowledge lights the future</div>
                    <div class="id_card_backward_center_first">Learning creates possibilities</div>
                </div>
            </div>
            <div class="id_card_download">
                <div><el-button type="primary" @click="downloadForward()">下載卡片正面</el-button></div>
                <div><el-button type="primary" @click="downloadBackward()">下載卡片背面</el-button></div>
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
                userImgUrl:''
            }
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
            JsBarcode(this.$refs.barcode, this.userInfo.idx, {
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
        width: 412.3px;
        height: 260px;
        background: white;
        border-radius: 15px;
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
        left: 7px;
        width: 200px;
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
        bottom: 20px;
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
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M 0 10 L 10 0 L 20 10 L 10 20 Z' fill='none' stroke='rgba(169,169,169,0.2)' stroke-width='0.5'/%3E%3C/svg%3E");
        background-size: 15px 15px; /* 縮小格子 */
        background-position: center; /* 設定網格重複位置 */
        
    }
    .id_card_backward_center{
        position: absolute;
        left: 0;
        top:0;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 100%;
        height: 40px;
        font-size: 14px;
        line-height: 20px;
        font-weight: bolder;
        text-align: center;
    }
    .id_card_download{
        width:220px;
        height: 160px;
        margin-left: 28px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
    }
</style>