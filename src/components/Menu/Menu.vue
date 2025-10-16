<template>
  <div class="menu">
    <div :class="{user:true,list_selected: $route.path.includes('/login') || $route.path.includes('Info')}"
         @click="isLogin?goTo(`/academic/${userInfo.typeEng}Info`):goTo('/academic/login')">
        <div :class="{list_selected_flag:$route.path.includes('/login') || $route.path.includes('Info')}" style="height: 130px; position: absolute; box-sizing: border-box;"></div>
        <div class="img_block" @click.stop="openImgUpload()">
            <img class="img" :src="userInfo.userImgUrl?userInfo.userImgUrl:'img/user.png'" alt="">
            <div class="img_upload">變更頭像
                <input type="file" @change="uploadUserImg()" class="img_upload_file" ref="img_upload_file" accept="image/*">
            </div>
        </div>
        <div :class="`username ${isLogin?'username_login':''}`">
            {{ isLogin?`${userInfo.name}`:'登入/註冊' }}
            <div v-if="isLogin" class="menu_level_box">
                <img class="menu_level_badge" :src="userInfo.level?`img/badge/${userInfo.level.level}.png`:'img/badge/1.png'">
                {{ userInfo.level? `${userInfo.level.levelTitle}`:''}} 
            </div>
        </div>
    </div>
    <div @click="goTo('/academic/post')" :class="{list:true,list_lock:!isLogin,list_selected: $route.path.includes('/post')}">
        <div :class="{list_selected_flag:$route.path.includes('/post')}"></div>
        <i class="fa-solid fa-lock lock" v-if="!isLogin"></i>
        平台公告
    </div>
    <div @click="isLogin?goTo('/academic/learn'):''" :class="{list:true,list_lock:!isLogin,list_selected: ($route.path.includes('/learn') || $route.path.includes('/class'))}">
        <div :class="{list_selected_flag:$route.path.includes('/learn')  || $route.path.includes('/class')}"></div>
        <i class="fa-solid fa-lock lock" v-if="!isLogin"></i>
        專欄列表
    </div>
    <div @click="isLogin?goTo('/academic/studyRoom'):''" :class="{list:true,list_lock:!isLogin,list_selected: $route.path.includes('/studyRoom')}">
        <div :class="{list_selected_flag:$route.path.includes('/studyRoom')}"></div>
        <i class="fa-solid fa-lock lock" v-if="!isLogin"></i>
        學習紀錄
    </div>
    <div v-if="isLogin" :class="{list:true}" @click="logout()">登出系統</div>
    <div class="version_info">
        <div>General Version 1.1.0.0</div>
    </div>
    <div class="footer" @click="goTo('/')"><img class="footer_img" src="img/horizontal_logo_white.png" alt="" > </div>
  </div>
</template>

<script>
import jsCookie from 'js-cookie'
import axios from 'axios'
export default {
    name:'Menu',
    data(){
        return{
            isLogin:false,
            userInfo:{
                account:'',
                name:'',
                userImgUrl:'',
                typeEng:'',
                type:''
            }
        }
    },
    mounted(){
        this.$bus.$on('setUserInfo',this.setUserInfo)
        this.$bus.$on('updateCurrentUser',this.updateCurrentUser)
    },
    methods:{
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
                    type: 'warning'
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
                    this.updateCurrentUser();
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
        async updateCurrentUser(){
            const token = jsCookie.get('authToken')
            const res = await axios.post('/login/token',{save:true},{
                headers:{
                    'x-user-token':token,
                    'x-user-fingerprint':localStorage.getItem('deviceFingerprint')
                }
            })
            if(res.data.type == 'success'){
                this.$bus.$currentUser = res.data.userInfo;
                this.setUserInfo();
            }
        },
        goTo(path){
            this.$router.push(path).catch((e)=>{})
        },
        setUserInfo(){
            const userInfo = this.$bus.$currentUser
            if(userInfo) this.isLogin = true;
            userInfo.userImgUrl += `?${new Date().getTime()}`
            this.userInfo = userInfo
        },
        logout(){
            this.$confirm('確認是否登出系統?', '提示', {
                confirmButtonText: '登出',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                jsCookie.remove('authToken')
                this.isLogin = false;
                this.$bus.$currentUser = {}
                this.userInfo = {}
                this.$bus.$emit('handleAlert','登出訊息','登出成功！','success')
                this.$router.replace('/academic/login').catch((e)=>{})
            }).catch(() => {});
        }
    }
}
</script>

<style scoped>
    .menu{
        width: 250px;
        height: 100vh;
        background: black;
        position: relative;
    }
    .user{
        width: 100%;
        height: 130px;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        color:white;
    }
    .img_block{
        width: 90px;
        height: 90px;
        background: white;
        border-radius: 90px;
        overflow: hidden;
        position: relative;
    }
    .img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .img_upload{
        position: absolute;
        width: 100%;
        height: 30px;
        line-height: 30px;
        color: white;
        font-size: 10px;
        text-align: center;
        background-color: rgba(0,0,0,0.5);
        left: 0;
        bottom: -30px;
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
    .username{
        width: 120px;
        height: 60px;
        line-height: 60px;
        text-align: center;
        overflow-y: scroll;
    }
    .username_login{
        line-height: 30px;
    }
    .menu_level_box{
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .menu_level_badge{
        width: 30px;
        height: 30px;
        object-fit: contain;
        margin-right: 5px;
    }
    .list{
        width:100%;
        height: 60px;
        line-height: 60px;
        text-align: center;
        color: white;
        transition: all 1s;
    }
    .lock{
        margin-right: 20px;
    }
    .user:hover,.list:hover,.list_selected{
        cursor: pointer;
        background: rgba(255,255,255,0.15);
        color: white;
    }
    .list_selected_flag{
        position: absolute;
        left: 0;
        width: 5px;
        height: 60px;
        background: white;
        transition: all 1s;
    }
    .list_lock{
        cursor: not-allowed !important;
    }
    .version_info{
        color: rgba(255,255,255,0.4);
        text-align: center;
        font-size: 12px;
        margin-top: 40px;
    }
    .footer{
        width:95%;
        height: 60px;
        position: absolute;
        bottom: 15px;
        left:2.5%;
    }
    .footer>img{
        width: 100%;
        margin: 0 auto;
    }
    .footer:hover{
        cursor: pointer;
    }
</style>