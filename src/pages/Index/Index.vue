<template>
    <div>
        <div class="header">
            <div class="logo"><img class="logo_img" src="img/horizontal_logo_white.png" alt="" @click="goTo('/')"></div>
            <div class="contact">
                <div class="contact_item">關於</div>
                <div class="contact_item">使用文件</div>
                <div class="contact_item">價目表</div>
                <div class="contact_item">開發團隊</div>
                <div class="contact_item">聯絡我們</div>
            </div>
        </div>
        <div class="top">
            <div class="content">
                <div class="title_block">
                    <div class="title">Sky Academy</div>
                    <div class="subTitle"><div class="subText" ref="subText">{{ subTitle }}</div></div>
                    <div class="box">
                        <div class="btn btn-1" @click="goTo('/academic')">快速開始 <i class="fa-solid fa-arrow-right start-arrow"></i></div>
                        <div class="btn btn-2">詳細資料 <i class="fa-solid fa-chevron-right"></i></div>
                    </div>
                </div>
                <div class="carousel">
                    <el-carousel :interval="3000" type="card" height="281.25px">
                        <el-carousel-item v-for="(item,id) in banner" :key="id">
                            <div class="medium">
                                <img :src="item" alt="">
                            </div>
                        </el-carousel-item>
                    </el-carousel>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
export default {
    name: "Index",
    data(){
        return {
            banner:['img/banner1.jpg','img/banner2.jpg','img/banner3.jpg'],
            subTitle:'We’ve released a new and streamlined student course management interface.'
        }
    },
    mounted(){
        setTimeout(() => {
            try{
                let el = this.$refs.subText;
                if(el) el.style = 'border-right:0'
            }
            catch(e){}
        }, 6500);
    },
    methods: {
        goTo(path){
            this.$router.push(path).catch((e)=>{})
        }
    },
    beforeDestroy(){
        
    }
};
</script>
  
<style scoped>
    .header{
        width: 100vw;
        min-width: 1440px;
        height: 90px;
        display: flex;
        position: fixed;
        top:0;
        left: 0;
        align-items: center;
        background: black;
        z-index: 1;
    }
    .logo{
        width: 250px;
        margin-left: 15px;
    }
    .logo_img{
        width:100%;
    }
    .logo_img{
        cursor: pointer;
    }
    .contact{
        width: 450px;
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        color: rgb(230,230,230);
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        margin-left: auto;
        margin-right: 10px;
    }
    .contact_item:hover{
        cursor: pointer;
        color: white;
    }
    .top {
        width: 100vw;
        min-width: 1440px;
        height: 100vh;
        min-height: 858px;
        color: white;
        background: black;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .content{
        width: 1000px;
        height: 580px;
        position: relative;
    }
    .time{
        font-weight: 500;
        text-align: center;
        font-size: 14px;
    }
    .title_block{
        width: 1000px;
        margin: 0 auto;
    }
    .title {
        font-weight: bolder;
        text-align: center;
        font-size: 64px;
        line-height: 2;
    }
    .subTitle {
        text-align: left;
        line-height: 17px;
        width: 580px;
        margin: 0 auto;
    }
    .subText {
        white-space: nowrap;
        overflow: hidden;
        border-right: 2px solid white;
        color: black;
        padding-right: 2px;
        width: 0;
        animation: typing 4s steps(77) 1s 1 normal forwards, blink 0.75s step-end infinite;
    }

    @keyframes typing {
        0% {
            width: 0;
            color: white;
            border-right: 2px solid white;
        }
        100% {
            width: 100%;
            color: white;
        }
    }
    @keyframes blink {
        0% {
            border-right-color: white;
        }
        50% {
            border-right-color: transparent;
        }
        100% {
            border-right-color: white;
        }
    }
    .box {
        width: 250px;
        height: 50px;
        border-radius: 50px;
        margin: 0 auto;
        margin-top: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .start-arrow{
        transform: rotate(-45deg);
    }
    .btn{
        width: 120px;
        height: 40px;
        line-height: 40px;    
        text-align: center;
        font-size: 14px;
    }
    .btn:hover{
        cursor: pointer;
    }
    .btn-1{
        color: white;
        margin-right: 10px;
        border-radius: 40px;
        border: 1px solid black;
        color: black;
        background: rgb(230,230,230);  
    }
    .btn-1:hover{
        background: white;
    }
    .btn-2{
        color: rgb(230,230,230);
    }
    .btn-2:hover{
        color:white;
    }
    .carousel{
        width: 1000px;
        margin: 0 auto;
        margin-top: 40px;
        position: absolute;
        bottom: 0;
    }
    .meduim{
        width: 100%;
    }
    .medium>img{
        width: 100%;
    }
    .el-carousel__item:nth-child(2n) {
        background-color: #99a9bf;
    }
    
    .el-carousel__item:nth-child(2n+1) {
        background-color: #d3dce6;
    }
    ::v-deep .el-carousel__indicator--horizontal{
        display: none !important;
    }
</style>