<template>
  <div class="view">
    <div class="header">使用者資料維護
        <el-button type="primary" class="btn" :loading="loading" @click="modifyData()">更新資料</el-button>
    </div>
    <div class="box">
        <div class="userInfoBox">
            <div class="user_info">
                <div class="inputBox"><div class="input_title">學號：</div><el-input placeholder="請輸入使用者學號" disabled v-model="userInfo.account"></el-input></div>
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
        <div class="id_card"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsCookie from 'js-cookie';
export default {
    name:'ModifyStudentInfo',
    data(){
        return {
            loading: false,
            idx:'',

            // 上傳圖片的 file
            file:{},
            userInfo:{
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
            }
            else this.$bus.$emit('handleAlert','使用者資料獲取通知',res.data.message,res.data.type)
        },
        async modifyData(){
            this.loading = true;
            let formData = new FormData();
            formData.append('userInfo',this.userInfo);
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
        }
    }
}
</script>

<style scoped>
    .view{
        width: calc(100vh - 250px);
        height: 100vh;
    }
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
</style>