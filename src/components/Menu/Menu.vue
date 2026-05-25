<template>
  <div class="menu">
    <div class="menu_logo" @click="goTo('/')"><img class="footer_img" src="img/horizontal_logo_white.png" alt="" > </div>
    <div @click="goTo('/academic/post')" :class="{list:true,list_lock:!isLogin,list_selected: $route.path.includes('/post')}">
        <i class="fa-solid fa-lock lock" v-if="!isLogin"></i>
         <i class="fa-brands fa-font-awesome unlock" v-else></i>
        平台公告
    </div>
    <div @click="isLogin?goTo('/academic/columnList'):''" :class="{list:true,list_lock:!isLogin,list_selected: ($route.path.includes('/column') && !($route.path.includes('/admin')))}">
        <i class="fa-solid fa-lock lock" v-if="!isLogin"></i>
        <i class="fa-solid fa-folder-open unlock" v-else></i>
        專欄列表
    </div>
    <div @click="isLogin?goTo('/academic/studyRoom'):''" :class="{list:true,list_lock:!isLogin,list_selected: $route.path.includes('/studyRoom')}">
        <i class="fa-solid fa-lock lock" v-if="!isLogin"></i>
        <i class="fa-solid fa-book unlock_2" v-else></i>
        學習紀錄
    </div>
    <div class="version_info">
        <div @click="goToOutlink('https://github.com/SCLemon/skyAcademy/releases')">General EX II v1.5.6.1</div>
    </div>
    <div class="memoryUsageBlock_wrapper">
        <div class="memoryUsageBlock">
            <div class="memoryUsageBlock_title">Memory Usage</div>
            <div class="memoryUsageBlock_subTitle">Measured using JavaScript heap usage for this page.</div>
            <div class="memoryUsageBlock_usage">{{memoryUsage}}</div>
            <div class="memoryUsageBlock_bar_wrapper">
                <div class="memoryUsageBlock_bar" :style="{ width: `${memoryPercent}%` }"></div>
            </div>
        </div>
    </div>
    <div class="user">
        <div class="img_block" @click.stop="openImgUpload()">
            <img class="img" :src="userInfo.userImgUrl?userInfo.userImgUrl:'img/user.png'" alt="">
            <div class="img_upload">變更頭像
                <input type="file" @change="uploadUserImg()" class="img_upload_file" ref="img_upload_file" accept="image/*">
            </div>
        </div>
        <div :class="`username ${isLogin?'username_login':''}`">
            {{ isLogin?`${userInfo.name}`:'登入/註冊' }}
        </div>
        <div v-if="isLogin" class="menu_more">
            <transition name="fade">
                <div class="menu_more_block" v-show="showOption">
                    <div class="menu_more_block_item" v-if="userInfo && userInfo.account != 'Visitor'" @click="userInfo.account == 'Visitor'?handleMore('logout'):handleMore('setting')"><i class="fa-solid fa-gear menu_more_block_item_icon"></i> 設定</div>
                    <div class="menu_more_block_item" @click="handleMore('logout')"><i class="fa-solid fa-right-to-bracket menu_more_block_item_icon_2"></i>登出</div>
                </div>
            </transition>
            <i class="fa-solid fa-bars menu_more_block_bars" @click="showOption = !showOption"></i>
        </div>
    </div>
  </div>
</template>

<script>
import jsCookie from 'js-cookie'
import axios from 'axios'
export default {
    name:'Menu',
    props:{
        userInfo:{
            type:Object,
            default () {
                return {
                    account: '',
                    name: '',
                    userImgUrl: '',
                    typeEng: '',
                    type: ''
                }
            }
        }
    },
    computed:{
        isLogin(){
            return !Object.values(this.userInfo).some(value => value === null || value === undefined || value === '')
        }
    },
    data(){
        return{
            showOption: false,
            memoryTimer: null,
            memoryUsage: '0 MB / 0 MB',
            memoryPercent: 0,
        }
    },
    mounted(){
        this.memoryTimer = setInterval(() => {
            if (performance.memory) {
                const mem = performance.memory;
                this.memoryUsage = `${(mem.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB / ${(mem.jsHeapSizeLimit / 1024 / 1024).toFixed(0)} MB`
                this.memoryPercent = (mem.usedJSHeapSize / mem.jsHeapSizeLimit * 100).toFixed(1);
            }
        }, 1000);
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
        handleMore(option){
            switch(option){
                case 'setting':
                    if(this.userInfo && this.userInfo.typeEng === 'teacher'){
                        this.goTo(`/academic/admin`)
                    }
                    else if(this.userInfo && this.userInfo.typeEng === 'student'){
                        this.goTo(`/academic/modifyInfo?idx=${this.userInfo.idx}`)
                    }
                    break;
                case 'logout':
                    this.logout()
            }
            this.showOption = false;
        },
        goToOutlink(path){
            window.open(path, '_blank');
        },
        goTo(path){
            if(path == '/academic/post' && this.$route.path.includes('/post')){
                const el = document.getElementById('postAll_wrapper')
                if (el) {
                    el.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }
            else if(path == '/academic/columnList' && this.$route.path.includes('/columnList')){
                const el = document.getElementById('columnList_wrapper')
                if (el) {
                    el.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }
            this.$router.push(path).catch((e)=>{}).finally(()=>{
                this.showOption = false;
            })
        },
        logout(){
            this.$confirm('確認是否登出系統?', '提示', {
                confirmButtonText: '登出',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                jsCookie.remove('authToken')
                localStorage.removeItem('currentUser')
                this.$bus.$emit('setUserInfo')
                this.$bus.$emit('handleAlert','登出訊息','登出成功！','success')
                this.$router.replace('/academic/login').catch((e)=>{})
            }).catch(() => {});
        }
    },
    beforeDestroy(){
        clearInterval(this.memoryTimer)
    }
}
</script>

<style scoped>
    .fade-enter-active,.fade-leave-active {
        transition: opacity 0.25s ease;
    }
    .fade-enter,.fade-leave-to {
        opacity: 0;
    }
    .menu{
        width: 250px;
        height: 100vh;
        background: black;
        position: relative;
    }
    .menu_logo{
        width:90%;
        height: 100px;
        display: flex;
        align-items: center;
        margin: 0 auto;
        margin-bottom: 5px;
        border-bottom: 1px solid rgba(255,255,255,0.15);
    }
    .menu_logo>img{
        width: 95%;
        margin: 0 auto;
    }
    .menu_logo:hover{
        cursor: pointer;
    }
    .list{
        width:100%;
        height: 60px;
        line-height: 60px;
        text-align: center;
        color: gray;
        transition: all 0.5s;
    }
    .list_selected{
        color: white;
    }
    .lock{
        margin-right: 14px;
    }
    .unlock{
        margin-right: 14px;
    }
    .unlock_2{
        margin-right: 16.5px;
    }
    .list:hover{
        cursor: pointer;
        color: white;
    }
    .list_lock{
        cursor: not-allowed !important;
    }
    .version_info{
        color: gray;
        text-align: center;
        font-size: 12px;
        margin-top: 40px;
    }
    .version_info:hover{
        cursor: pointer;
        color: white;
        transition: color 0.5s ease;
    }

    .memoryUsageBlock_wrapper{
        width: 210px;
        height: 150px;
        margin: 0 auto;
        position: absolute;
        left: 20px;
        bottom: 125px;
        background: rgba(255,255,255,0.1);
        border-radius: 9px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .memoryUsageBlock{
        width: 170px;
        height: auto;
    }
    .memoryUsageBlock_title{
        color: rgba(255,255,255,0.9);
        margin-bottom: 10px;
    }
    .memoryUsageBlock_subTitle{
        color: rgba(255,255,255,0.7);
        text-align: justify;
        line-height: 1.25;
        font-size: 13px;
        margin-bottom: 15px;
    }
    .memoryUsageBlock_usage{
        font-size: 11px;
        color: rgba(255,255,255,0.7);
        width: 100%;
        text-align: right;
        margin-bottom: 9px;
    }
    .memoryUsageBlock_bar_wrapper{
        width: 100%;
        height: 6px;
        background: rgba(255,255,255,0.1);
    }
    .memoryUsageBlock_bar{
        width: 0%;
        height: 6px;
        background: rgba(255,255,255,0.7);
        transition: 0.2s width ease;
    }
    .user{
        width: 90%;
        height: 100px;
        display: flex;
        align-items: center;
        color:white;
        position: absolute;
        bottom: 3px;
        left: 5%;
        border-top: 1px solid rgba(255,255,255,0.15);
    }
    .img_block{
        width: 53px;
        height: 53px;
        background: white;
        border-radius: 53px;
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
        height: 17px;
        line-height: 17px;
        color: white;
        font-size: 8px;
        text-align: center;
        background-color: rgba(0,0,0,0.5);
        left: 0;
        bottom: -17px;
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
        width: 114px;
        line-height: 100px;
        margin-left: 18px;
        overflow-y: scroll;
    }
    .username_login{
        line-height: 30px;
    }
    .menu_more{
        width: 20px;
        text-align: center;
        position: relative;
    }
    .menu_more_block{
        position: absolute;
        width: 100px;
        background: rgba(255,255,255,0.1);
        bottom: 80%;
        right: 0;
        border-radius: 2px;
    }
    .menu_more_block_item{
        width: 100%;
        height: 40px;
        color: white;
        line-height: 40px;
        font-size: 14px;
        color: gray;
        transition: all 0.5s;
        
    }
    .menu_more_block_item:hover{
        cursor: pointer;
        color: white;
    }
    .menu_more_block_item_icon{
        margin-right: 8px;
    }
    .menu_more_block_item_icon_2{
        margin-right: 12px;
    }
    .menu_more_block_bars{
        height: 100px;
        width: 100%;
        line-height: 100px;
        color:gray;
        transition: all 0.5s;
    }
    .menu_more_block_bars:hover{
        cursor: pointer;
        color: white;
    }
</style>