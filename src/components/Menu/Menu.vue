<template>
  <div class="menu">
    <div :class="{user:true,list_selected: $route.path.includes('/login') || $route.path.includes('/studentInfo') || $route.path.includes('/teacherInfo')}"
         @click="isLogin?goTo(`/academic/${userInfo.typeEng}Info`):goTo('/academic/login')">
        <img class="img" src="img/user.png" alt="">
        <div class="username">{{ isLogin?`${userInfo.account} (${userInfo.type})`:'登入/註冊' }}</div>
    </div>
    <div @click="goTo('/academic/post')" :class="{list:true,list_selected: $route.path.includes('/post')}">課程公告</div>
    <div @click="goTo('/academic/learn')" :class="{list:true,list_selected: $route.path.includes('/learn')}">教學影音</div>
    <div @click="goTo('/academic/practice')" :class="{list:true,list_selected: $route.path.includes('/practice')}">課後練習</div>
    <div v-if="isLogin" :class="{list:true}" @click="logout()">登出系統</div>
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
            this.$router.replace(path).catch((e)=>{})
        },
        setUserInfo(userInfo){
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
        white-space: nowrap;
        overflow-y: scroll;
    }
    .list{
        width:100%;
        height: 60px;
        line-height: 60px;
        text-align: center;
        color: white;
    }
    .user:hover,.list:hover,.list_selected{
        cursor: pointer;
        background: white;
        color: black;
    }
</style>