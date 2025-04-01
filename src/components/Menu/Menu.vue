<template>
  <div class="menu">
    <div :class="{user:true,list_selected: $route.path.includes('/login') || $route.path.includes('/studentInfo') || $route.path.includes('/teacherInfo')}"
         @click="isLogin?goTo(`/academic/${userInfo.typeEng}Info`):goTo('/academic/login')">
        <img class="img" :src="userInfo.userImgUrl?userInfo.userImgUrl:'img/user.png'" alt="">
        <div :class="`username ${isLogin?'username_login':''}`">
            {{ isLogin?`${userInfo.name}`:'登入/註冊' }}
            <div>(職稱：{{userInfo.type}})</div>
        </div>
    </div>
    <div @click="goTo('/academic/post')" :class="{list:true,list_lock:!isLogin,list_selected: $route.path.includes('/post')}"><i class="fa-solid fa-lock lock" v-if="!isLogin"></i>平台公告</div>
    <div @click="isLogin?goTo('/academic/learn'):''" :class="{list:true,list_lock:!isLogin,list_selected: $route.path.includes('/learn')}"><i class="fa-solid fa-lock lock" v-if="!isLogin"></i>課程列表</div>
    <div @click="isLogin?goTo('/academic/practice'):''" :class="{list:true,list_lock:!isLogin,list_selected: $route.path.includes('/practice')}"><i class="fa-solid fa-lock lock" v-if="!isLogin"></i>課後練習</div>
    <div v-if="isLogin" :class="{list:true}" @click="logout()">登出系統</div>
    <div class="footer"><img class="footer_img" src="img/horizontal_logo_white.png" alt="" @click="goTo('/')"> </div>
  </div>
</template>

<script>
import jsCookie from 'js-cookie'
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
    },
    methods:{
        goTo(path){
            this.$router.push(path).catch((e)=>{})
        },
        setUserInfo(){
            const userInfo = this.$bus.$currentUser
            if(userInfo) this.isLogin = true;
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
                this.$router.replace('/academic/login')
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
    .img{
        width: 90px;
        height: 90px;
        background: white;
        border-radius: 90px;
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
    .list{
        width:100%;
        height: 60px;
        line-height: 60px;
        text-align: center;
        color: white;
    }
    .lock{
        margin-right: 20px;
    }
    .user:hover,.list:hover,.list_selected{
        cursor: pointer;
        background: white;
        color: black;
    }
    .list_lock{
        cursor: not-allowed !important;
    }
    .footer{
        width:100%;
        height: 60px;
    }
    .footer>img{
        width: 100%;
        margin: 0 auto;
        position: absolute;
        bottom: 15px;
    }
    .footer_img:hover{
        cursor: pointer;
    }
</style>