<template>
  <div class="select_wrapper" v-if="isLogin">
    <div class="select">
        <div class="select_mask" :style="{ left: `${activeOption * 20}%` }"></div>
        <div class="option" @click="goTo('/academic/post')"><i class="fa-solid fa-house"></i></div>
        <div class="option" @click="goTo('/academic/columnList')"><i class="fa-solid fa-folder-open"></i></div>
        <div class="option" @click="goTo('/academic/studyRoom')"><i class="fa-solid fa-book"></i></div>
        <div class="option" @click="userInfo && userInfo.account != 'Visitor'? goToProfile():showNotAllowed()">
            <i v-if="!userInfo.userImgUrl ||userInfo.userImgUrl.includes('img/user.png')" class="fa-solid fa-user"></i>
            <img v-else class="userIcon" :src="userInfo.userImgUrl" alt="">
        </div>
        <div class="option" @click="logout()"><i class="fa-solid fa-arrow-right-from-bracket"></i></div>
    </div>
  </div>
</template>

<script>
import jsCookie from 'js-cookie';
export default {
    name:'Menu_Mobile',
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
    data(){
        return {
        }
    },
    computed:{
        activeOption(){
            if(this.$route.path.includes('/post')) return 0;
            else if (this.$route.path.includes('/column') && !(this.$route.path.includes('/admin'))) return 1;
            else if (this.$route.path.includes('/studyRoom')) return 2;
            else if (this.$route.path.includes('/admin') || this.$route.path.includes('/modifyInfo')) return 3;
            else return -2;
        },
        isLogin(){
            return !Object.values(this.userInfo).some(value => value === null || value === undefined || value === '')
        }
    },
    methods:{
        goTo(path){
            if(path == '/academic/post' && this.$route.path.includes('/post')){
                const el = document.getElementById('postAll_wrapper')
                if (el) {
                    el.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }
            else if(path == '/academic/columnList' && this.$route.path.includes('/columnList')){
                const el = document.getElementById('classList')
                if (el) {
                    el.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }
            this.$router.push(path).catch((e)=>{})
        },
        goToProfile(){
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if(!currentUser) return;

            if(currentUser.typeEng === 'teacher') this.goTo(`/academic/admin`)
            else if(currentUser.typeEng === 'student') this.goTo(`/academic/modifyInfo?idx=${currentUser.idx}`)
        },
        showNotAllowed(){
            this.$bus.$emit('handleAlert','訪客模式限制','訪客模式無法進入個人頁面。','warning')
        },
        logout(){
            this.$confirm('確認是否登出系統?', '提示', {
                confirmButtonText: '登出',
                cancelButtonText: '取消',
                type: 'warning',
                customClass:'PWACSS_MessageBox'
            }).then(() => {
                jsCookie.remove('authToken')
                localStorage.removeItem('currentUser')
                this.$bus.$emit('setUserInfo')
                this.$bus.$emit('handleAlert','登出訊息','登出成功！','success')
                this.$router.replace('/academic/login').catch((e)=>{})
            }).catch(() => {});
        }
    }
}
</script>

<style scoped>
    .select_wrapper{
        width: 100%;
        height: auto;
        background: rgba(0,0,0,0.3);
        backdrop-filter: blur(1.5px);
        box-sizing: border-box;
        border-radius: 30px;
    }
    .select{
        width: calc(100% - 15px);
        height: 55px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        position: relative;
        box-sizing: border-box;
    }
    .select_mask{
        z-index: 1;
        position: absolute;
        width: 20%;
        height: 45px;
        border-radius: 55px;
        background: rgba(255,255,255,0.2);
        transition: 0.5s left ease;
        box-sizing: border-box;
    }
    .option{
        width: 20%;
        height: 40px;
        border-radius: 55px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        z-index:2;
    }
    .option:hover{
        cursor: pointer;
    }
    .userIcon{
        width: 24px;
        height: 24px;
        border-radius: 24px;
    }

</style>