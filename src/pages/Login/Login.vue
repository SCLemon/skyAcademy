<!-- 練習 -->
<template>
  <div class="view">
    <div class="box">
      <div class="header"><i class="fa-solid fa-id-card"></i> 會員登入</div>
      <div class="login"><div class="login_text">帳號：</div><el-input placeholder="請輸入帳號" v-model="student.account" clearable></el-input></div>
      <div class="login"><div class="login_text">密碼：</div><el-input placeholder="請輸入密碼" v-model="student.password" clearable show-password></el-input></div>
      <div class="btn"><el-button type="primary" @click="login('student')">會員登入</el-button></div>
    </div>
    <div class="box">
      <div class="header"><i class="fa-solid fa-id-card"></i> 管理員登入</div>
      <div class="login"><div class="login_text">帳號：</div><el-input placeholder="請輸入帳號" v-model="teacher.account" clearable></el-input></div>
      <div class="login"><div class="login_text">密碼：</div><el-input placeholder="請輸入密碼" v-model="teacher.password" clearable show-password></el-input></div>
      <div class="btn"><el-button type="primary" @click="login('teacher')">管理員登入</el-button></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name:'Login',
  data(){
    return {
      text:'',
      student:{
        account:'',
        password:'',
        type:'student'
      },
      teacher:{
        account:'',
        password:'',
        type:'teacher'
      }
    }
  },
  mounted(){

  },
  methods:{
    async login(type){
      let data;
      if(Object.values(this[type]).some(value => value === null || value === undefined || value.trim() === '')){
          return this.$bus.$emit('handleAlert','登入訊息','登入資料不可為空。','error')
      }
      try{
        const res = await axios.post('/login/verify',this[type],
          {
                headers: {
                  'x-user-fingerprint': localStorage.getItem('deviceFingerprint')
                }
          }
        )
        data = res.data;
        if(data.type == 'success'){
          this.$bus.$currentUser = res.data.userInfo
          this.$bus.$emit('setUserInfo')
          this.$router.replace(`/academic/${type}Info`).catch((e)=>{})
        }
      }
      catch(e){}
      finally{
        this.$bus.$emit('handleAlert','登入訊息',data.message,data.type)
      }
    },
  }
}
</script>

<style scoped>
  .view{
    width: calc(100vw - 250px);
    height: 100vh;
    display: flex;
    justify-content: space-evenly;
  }
  .box{
    width: 45%;
    margin: 0 auto;
    margin-top: 40px;
  }
  .btn{
    margin-top: 20px;
    float: right;
  }
  .header{
    height: 60px;
    line-height: 60px;
    font-size: 24px;
  }
  .login_text{
    line-height: 3;
  }
</style>