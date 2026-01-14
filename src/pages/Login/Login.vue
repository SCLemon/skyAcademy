<template>
  <div class="view">
    <div class="form_wrapper">
        <div class="normalForm">
          <div class="header"><i class="fa-solid fa-id-card card_icon"></i> 一般登入</div>
          <div class="login"><div class="login_text">帳號：</div><el-input placeholder="請輸入帳號" v-model="loginData.account" clearable></el-input></div>
          <div class="login"><div class="login_text">密碼：</div><el-input placeholder="請輸入密碼" v-model="loginData.password" clearable show-password></el-input></div>
          <div class="btn"><el-button type="primary" @click="login()">會員登入</el-button></div>
        </div>
        <div class="fast_header"><i class="fa-solid fa-id-card card_icon"></i> 會員卡快速通道</div>
        <div class="fastForm">
          <el-button type="warning" v-if="!fast_login_isOpen" @click="openInput()">上傳電子會員卡</el-button>
          <input type="file" class="fastInput" ref="fastInput" @change="fastLogin($event)">
        </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import jsCookie from 'js-cookie';
export default {
  name:'Login',
  data(){
    return {
      text:'',
      loginData:{
        account:'',
        password:'',
      },
      fast_login_isOpen:false,
    }
  },
  mounted(){
  },
  methods:{
    async login(){
      let data;
      if(Object.values(this.loginData).some(value => value === null || value === undefined || value.trim() === '')){
          return this.$bus.$emit('handleAlert','登入訊息','登入資料不可為空。','error')
      }
      try{
        const res = await axios.post('/login/verify',this.loginData,
          {
                headers: {
                  'x-user-fingerprint': localStorage.getItem('deviceFingerprint')
                }
          }
        )
        data = res.data;
        if(data.type == 'success'){
          localStorage.setItem('currentUser', JSON.stringify(res.data.userInfo))
          this.$bus.$emit('setUserInfo')
          this.$router.replace(`/academic/post`).catch((e)=>{})
        }
      }
      catch(e){}
      finally{
        this.$bus.$emit('handleAlert','登入訊息',data.message,data.type)
      }
    },

    // 快速登入通道
    openInput(){
      this.$refs.fastInput.click();
    },
    async fastLogin(event){
      const file = event.target.files[0];
      if (!file) return;
      
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const token = this.readTokenFromHead(canvas);

      URL.revokeObjectURL(img.src);
      this.fast_login_isOpen = true;
      try{
        const res = await axios.post('/login/token',{save:false},{
          headers:{
              'x-user-token':token,
              'x-user-fingerprint':localStorage.getItem('deviceFingerprint')
          }
        })
        if(res.data.type == 'success'){
          jsCookie.set('authToken',token);
          localStorage.setItem('currentUser', JSON.stringify(res.data.userInfo))
          this.$bus.$emit('setUserInfo')
          this.$router.replace('/academic/post').catch((e)=>{})
        }
        this.$bus.$emit('handleAlert','登入訊息',res.data.message,res.data.type)
      }
      catch(e){
        this.$bus.$emit('handleAlert','登入訊息','伺服器錯誤，請洽客服人員。','error')
      }
      finally{
        this.fast_login_isOpen = false;
      }
    },
    readTokenFromHead(canvas) {
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      const img = ctx.getImageData(0, 0, width, height);
      const data = img.data;

      const readBit = i => (data[i * 4 + 2] & 1); // Blue LSB

      // 讀取 2 bytes 長度（小端）
      let len = 0;
      for (let i = 0; i < 16; i++) len |= (readBit(i) << i);

      const totalBits = 16 + len * 8;
      if (totalBits > width * height) throw new Error('沒有合理的隱藏資料');

      const bytes = new Uint8Array(len);
      for (let b = 0; b < len; b++) {
        let v = 0;
        for (let i = 0; i < 8; i++) v |= (readBit(16 + b * 8 + i) << i);
        bytes[b] = v;
      }
      return new TextDecoder().decode(bytes);
    }
  }
}
</script>

<style scoped>
  .view{
    width: calc(100vw - 250px);
    height: 100vh;
    padding-left: 50px;
    padding-right: 50px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .form_wrapper{
    width: 100%;
    height: auto;
  }
  .normalForm{
    width: 100%;
    height: 338px;
    margin-top: 20px;
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
  .fastForm{
    width: 100%;
    height: 40vh;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .fast_header{
    height: 60px;
    line-height: 60px;
    font-size: 24px;
  }
  .fastInput{
    display: none;
  }
  .card_icon{
    margin-right: 5px;
  }
  @media screen and (max-width: 440px) {
    .view{
      width: 100vw;
    }
    .fastForm{
      height: 30vh;
    }
  }
</style>