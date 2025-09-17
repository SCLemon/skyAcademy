<template>
    <div class="view">
        <div class="header">
            <div class="logo"><img class="logo_img" src="img/horizontal_logo_white.png" alt="" @click="goTo('/')"></div>
            <div class="contact">
                <div class="contact_item" @click="scrollToSection('top')">前往探索</div>
                <div class="contact_item" @click="scrollToSection('developer')">版主介紹</div>
                <div class="contact_item" @click="scrollToSection('contact')">聯絡我們</div>
            </div>
        </div>
        <div class="top" ref="top">
            <div class="content">
                <div class="title_block">
                    <div class="title">Lemon's Websites</div>
                    <div class="subTitle"><div class="subText" ref="subText">{{ subTitle }}</div></div>
                    <div class="box">
                        <div class="btn btn-1" @click="goTo('/academic')">進入基地 <i class="fa-solid fa-arrow-right start-arrow"></i></div>
                        <div class="btn btn-2" @click="scrollToSection('developer')">版主介紹 <i class="fa-solid fa-chevron-right"></i></div>
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
        <div class="developer" ref="developer">
            <div class="developer_title">版主介紹</div>
            <div class="developer_content">
                <div class="developer_img"><img src="img/author.jpg" alt=""></div>
                <div class="developer_intro_box">
                    <div class="developer_name">主要作者：林英豪</div>
                    <div class="developer_detail">
                  嗨，我是林英豪，也可以叫我 SCLemon。目前就讀於國立清華大學碩士學位，研究領域為「前瞻半導體二維材料元件設計」。同時，我對人工智慧、前端開發與投資研究也充滿熱情。從理論到實作，我喜歡把想法化為具體成果──無論是自行訓練 LSTM 股價預測模型、嘗試大語言模型的本地部署，還是開發 Vue.js 專案與 Chrome 擴充功能，都是我探索的旅程。
                 </br>在學習與研究的過程中，我不僅追求技術上的突破，也重視創意與應用的延展。對我來說，科技就像「檸檬」──看似平凡，卻能激發無限可能，既能為生活增添風味，也能成為靈感的起點。這裡是我的小小天地，用來分享我的學習、作品與想法。如果你也對人工智慧、程式設計，或是創新的投資思維感興趣，歡迎一起交流，探索更廣闊的世界。
                </div>
                </div>
            </div>
        </div>
        <div class="footer" ref="contact">
            <div class="footer_item">
                <div>聯絡方式：blc0000421@gmail.com</div>
                <div>Copyright © 2025 Lemon's Universe All Rights Reserved</div>
            </div>
        </div>
        <div class="back" @click="scrollToSection('top')"><i class="fa-solid fa-angles-up"></i></div>
    </div>
</template>
  
<script>
export default {
    name: "Index",
    data(){
        return {
            banner:['img/banner1.jpg','img/banner2.jpg','img/banner3.jpg'],
            subTitle:'Step into Lemon’s Universe — A Journey of Curiosity, Creation, and Endless Discovery.'
        }
    },
    mounted(){
        setTimeout(() => {
            try{
                let el = this.$refs.subText;
                if(el) el.style = 'border-right:none;'
            }
            catch(e){}
        }, 6500);
    },
    methods: {
        goTo(path){
            this.$router.push(path).catch((e)=>{})
        },
        scrollToSection(refName) {
            const element = this.$refs[refName];
            if (element) {
                const offset = 120;
                const top = element.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top,
                    behavior: 'smooth'
                });
            }
        }
    },
    beforeDestroy(){
        
    }
};
</script>
  
<style scoped>
    .view{
        min-width: 1440px;
    }
    .back{
        position: fixed;
        bottom: 105px;
        right: 15px;
        width: 60px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        color: white;
        font-size: 24px;
        text-shadow: 1px 1px 1px black;
        background: rgba(0,0,0,0.3);
        border-radius: 5px;
    }
    .back:hover{
        cursor: pointer;
        background: rgba(0,0,0,0.6);
    }
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
        z-index: 3;
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
        width: auto;
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        color: rgb(230,230,230);
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        margin-left: auto;
        margin-right: 10px;
        transition: all 0.25s;
    }
    .contact_item:hover{
        cursor: pointer;
        color: white;
    }
    .contact_item{
        width: 100px;
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
        display: flex;
        justify-content: center;
        flex-direction: column;
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
        width: auto;
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
        transition: all 0.25s;
    }
    .btn-1:hover{
        background: white;
    }
    .btn-2{
        color: rgb(230,230,230);
        transition: all 0.25s;
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

    .intro{
        width: 100%;
    }
    .intro_title_1{
        width: 90%;
        height: 100px;
        margin: 0 auto;
        line-height: 100px;
        text-align: left;
        font-size: 28px;
        font-weight: bolder;
    }
    .intro_title_2{
        width: 90%;
        height: 100px;
        margin: 0 auto;
        line-height: 100px;
        text-align: right;
        font-size: 28px;
        font-weight: bolder;
    }
    .intro_simple_box{
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }
    .intro_simple{
        width: 50%;
    }
    .intro_img{
        width: 540.44px;
        height: 304px;
    }
    .intro_img>img{
        width: 100%;
    }
    .intro_text_title{
        width: 95%;
        margin: 0 auto;
        font-weight: bolder;
        margin-bottom: 10px;
        line-height: 2;
        font-size: 18px;
    }
    .intro_text{
        width: 95%;
        margin: 0 auto;
        line-height: 2;
        text-align: justify;
        margin-bottom: 10px;
    }
    .calculator{
        width: 100%;
        background: black;
        margin-top: 40px;
        color: white;
    }
    .calculator_title{
        width: 90%;
        height: 100px;
        margin: 0 auto;
        line-height: 100px;
        text-align: center;
        font-size: 28px;
        font-weight: bolder;
    }
    .calculator_box_all{
        width: 100%;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        padding-bottom: 40px;
    }
    .calculator_box{
        width: 23%;
        height: 280px;
        border-radius: 10px;
        border: 0.1px solid gray;
        box-shadow: 6px 6px 10px white;
    }
    .calculator_box_title{
        width: 100%;
        height: 80px;
        line-height: 80px;
        font-size: 24px;
        text-align: center;
    }
    .calculator_detail{
        width: 90%;
        margin: 0 auto;
    }
    .detail{
        line-height: 45px;
    }
    .developer{
        width: 100%;
        margin-bottom: 25px;
    }
    .developer_title{
        width: 100%;
        height: 80px;
        line-height: 80px;
        font-size: 28px;
        text-align: center;
        font-weight: bolder;
    }
    .developer_content{
        width: 100%;
        height: 300px;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }
    .developer_img{
        width: 270px;
        height: 270px;
        border-radius: 270px;
        overflow: hidden;
    }
    .developer_img>img{
        width: 100%;
    }
    .developer_intro_box{
        width: 1000px;
        height: 270px;
    }
    .developer_name{
        width: 100%;
        height: 65px;
        font-size: 24px;
        font-weight: bolder;
        line-height: 65px;
    }
    .developer_intro{
        width: 100%;
        height: 190px;
        text-align: justify;
        padding: 10px;
        box-sizing: border-box;
    }
    .developer_detail{
        text-align: justify;
        line-height: 2;
    }
    .footer{
        width: 100%;
        height: 110px;
        background: black;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .footer_item{
        line-height: 2;
        text-align: center;
    }
</style>