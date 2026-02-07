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
                    <div class="subTitle">
                        <div class="subText subTextForPC" ref="subTextForPC">{{ subTextForPC }}</div>
                        <div class="subText subTextForMobile" ref="subTextForMobile">{{ subTextForMobile }}</div>
                    </div>
                    <div class="box">
                        <div class="btn btn-1" @click="goTo('/academic')">進入基地 <i class="fa-solid fa-arrow-right start-arrow"></i></div>
                        <div class="btn btn-2" @click="scrollToSection('developer')">版主介紹 <i class="fa-solid fa-chevron-right"></i></div>
                    </div>
                </div>
                <div class="carousel">
                    <el-carousel  type="card" :interval="5000">
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
                    <div class="developer_name">網站作者：林英豪</div>
                    <div class="developer_detail">
                    嗨，我是林英豪，也可以叫我 SCLemon。 目前就讀於國立清華大學碩士班，研究領域為「前瞻半導體二維材料元件設計」。在研究與實作歷程中，我累積了從光罩圖案設計與下線、材料成長與製程整合，到元件電性量測與參數優化的完整經驗，對半導體元件的設計邏輯與實際製程之間的連結有扎實理解。 
                    <br> 除了在半導體領域持續深耕，我同時對人工智慧、前端開發與投資研究保有高度熱情。我喜歡將抽象的想法落實為可運作的系統與成果——無論是自行訓練 LSTM 股價預測模型、應用 PINNs 於物理問題建模、進行大語言模型的本地部署與 Fine-tuning，抑或是開發提升日常效率的擴充小工具，都是我探索與實驗的一部分。 
                </div>
                </div>
            </div>
        </div>
        <div class="transition">
            <div class="transition_detail">對我而言，科技就像「檸檬（Lemon）」—— 看似平凡，卻能激發無限可能；既能為生活增添風味，也能成為創新的起點。</div>
        </div>
        <div class="skill">
            <div class="skill_title">專業技能</div>
            <div class="skill_box_wrapper">
                <div class="skill_box">
                    <div class="skill_box_title">半導體二維材料研究</div>
                    <div class="skill_box_subText">具備從光罩設計與下線、材料成長與製程整合，到元件電性量測與參數優化的實作經驗，熟悉研發流程中製程條件—元件結構—電性表現之間的因果關係，能根據量測結果進行問題定位、實驗設計與製程優化，並以良率與重現性思維進行數據導向分析，支援跨模組整合決策，加速研發收斂。</div>
                    <div class="skill_box_img">
                        <img src="img/processing.png" alt="">
                    </div>
                </div>
                <div class="skill_box">
                    <div class="skill_box_title">應用程式設計與實作</div>
                    <div class="skill_box_subText">具備以 Python 為核心的程式設計能力，能將工程與研究問題轉化為可執行的程式流程，應用於實驗數據分析、自動化處理與模型建構。熟悉機器學習、基礎深度學習訓練流程，並能結合物理知識提升模型可解釋性與穩定性；同時具備前端與工具型程式開發經驗，能有效將想法落實為實際可用的系統。</div>
                    <div class="skill_box_img">
                        <img src="img/coding.png" alt="">
                    </div>
                </div>
                <div class="skill_box">
                    <div class="skill_box_title">自主學習與解決問題的能力</div>
                    <div class="skill_box_subText">具備高度自主學習與問題導向能力，能在面對不熟悉的技術或研究議題時，快速建立知識脈絡，透過文獻查證、實驗設計與數據驗證釐清關鍵因素，並將新知有效轉化為可落地的實作與流程優化，持續縮短學習曲線並提升研究與工程效率，同時能在有限資源與時程下穩定推進任務完成。</div>
                    <div class="skill_box_img">
                        <img src="img/learning.png" alt="">
                    </div>
                </div>
            </div>
        </div>
        <div class="transition">
            <div class="transition_detail">也正因具備良好的自律性，以及自主學習與問題解決能力，使我能夠在不依賴他人的情境下，主動規劃方向、整合資源，並以自身能力穩定推進並完成目標。</div>
        </div>
        <div class="feedback">
            <div class="feedback_title">技術分享 × 知識傳承 × 實際影響力</div>
            <div class="feedback_subText">此外，我也長期致力於將自身所累積的知識與實作經驗系統化並分享給更多人，透過撰寫技術文章、參與開源專案以及教學與指導活動，協助他人在面對複雜技術概念時，能更有效地建立理解脈絡並提升實務能力。在這個過程中，我不僅扮演知識傳遞者的角色，也透過回饋與討論持續檢視並深化自身理解，形成正向的學習循環。 我期望透過持續的知識整理、實踐與傳承，讓技術不只停留在個人層面，而能轉化為可被複製、擴散並長期累積的價值，進而為團隊與社會創造更深遠且實質的影響。</div>
            <div class="feedback_wrapper">
                <div class="feedback_box">
                    <carousel :postImg="feedbackImg"></carousel>
                </div>
                <div class="feedback_box feedback_box_2">
                    <feedback></feedback>
                </div>
            </div>
        </div>
        <div class="footer" ref="contact">
            <div class="footer_item">
                <div>聯絡方式：blc0000421@gmail.com</div>
                <div>Copyright © 2026 Lemon's Universe All Rights Reserved</div>
            </div>
        </div>
        <div class="back" @click="scrollToSection('top')"><i class="fa-solid fa-angles-up"></i></div>
    </div>
</template>
  
<script>
import Carousel from '../Post/components/Carousel.vue';
import Feedback from './components/Feedback.vue';
export default {
    name: "Index",
    components:{
        Carousel, Feedback
    },
    data(){
        return {
            banner:['img/banner1.jpg','img/banner2.jpg','img/banner3.jpg'],
            subTextForPC:'Step into Lemon’s Universe — A Journey of Curiosity, Creation, and Endless Discovery.',
            subTextForMobile: 'A Journey of Curiosity, Creation, and Endless Discovery.',
            subTextEls:[],
            feedbackImg:[{
                url:'/img/feedback1.jpg',
            },
            {
                url:'/img/feedback2.jpg',
            },
            {
                url:'/img/feedback3.jpg',
            }],
        }
    },
    mounted(){
        this.subTextEls = document.querySelectorAll('.subText')
        this.subTextEls.forEach(el => {
            el.addEventListener('animationend', this.onTypingEnd)
        })
    },
    methods: {
        async delay(ms){
            return new Promise((resolve)=>setTimeout(resolve,ms))
        },
        async onTypingEnd(e) {
            if (!e.animationName) return
            await this.delay(2000)
            e.target.style.borderRight = 'none'
        },
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
        if (!this.subTextEls) return
        this.subTextEls.forEach(el => {
            el.removeEventListener('animationend', this.onTypingEnd)
        })  
    }
};
</script>
  
<style scoped>
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
    .contact, .contact_2{
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
        height: 100vh;
        color: white;
        background: black;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .content{
        width: 1000px;
        height: auto;
        position: relative;
        overflow-x: hidden;
    }
    .time{
        font-weight: 500;
        text-align: center;
        font-size: 14px;
    }
    .title_block{
        width: 100%;
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
    .subTextForPC{
        display: block;
    }
    .subTextForMobile{
        display: none;
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
        width: 100%;
        margin: 0 auto;
        margin-top: 40px;
    }
    .carousel :deep(.el-carousel__item) {
        aspect-ratio: 16 / 9;
        height: auto;
    }

    .carousel :deep(.el-carousel__container) {
        width: 100%;
        height: auto !important;
        aspect-ratio: 10 / 2.85;
    }
    .carousel :deep(.el-carousel__mask) {
        background-color: transparent;
    }
    .meduim{
        width: 100%;
    }
    .medium>img{
        width: 100%;
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
    }
    .developer_content{
        width: 100%;
        height: 300px;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        margin-bottom: 15px;
    }
    .developer_title{
        width: 100%;
        height: 80px;
        line-height: 80px;
        font-size: 28px;
        text-align: center;
        font-weight: bolder;
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
    .developer_detail{
        text-align: justify;
        line-height: 2;
    }

    .transition{
        width: 100%;
        height: 120px;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        background: black;
    }
    .transition_detail{
        color: white;
        line-height: 1.5;
        font-size: 16px;
        width: 90%;
        text-align: center;
    }
    .skill{
        width: 100%;
        padding-bottom: 30px;
    }
    .skill_title{
        width: 100%;
        height: 80px;
        line-height: 80px;
        font-size: 28px;
        text-align: center;
        font-weight: bolder;
    }
    .skill_box_wrapper{
        width: 100%;
        height: auto;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }
    .skill_box{
        width: 30%;
        background: black;
        border-radius: 12px;
        box-sizing: border-box;
        color: white;
        padding-bottom: 15px;
    }
    .skill_box_title{
        width: 100%;
        font-size: 24px;
        text-align: center;
        line-height: 80px;
    }
    .skill_box_subText{
        width: 95%;
        margin: 0 auto;
        font-size: 14px;
        text-align: justify;
        line-height: 1.75;
        height: auto;
        max-height: 150px;
        overflow-y: scroll;
        margin-bottom: 8px;
    }
    .skill_box_img{
        margin-top: 20px;
        width: 95%;
        margin: 0 auto;
        box-sizing: border-box;
    }
    .skill_box_img>img{
        width: 100%;
    }

    .feedback{
        width: 100%;
        margin-bottom: 20px;
    }
    .feedback_title{
        width: 100%;
        height: 80px;
        line-height: 80px;
        font-size: 28px;
        text-align: center;
        font-weight: bolder;
    }
    .feedback_subText{
        width: 95%;
        margin: 0 auto;
        text-align: justify;
        line-height: 1.75;
    }
    .feedback_wrapper{
        width: 95%;
        margin: 0 auto;
        margin-top: 20px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
    }
    .feedback_box{
        width: 49%;
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
    @media screen and (max-width: 440px) {
        .logo{
            width: 235px;
        }
        .contact{
            display: none;
        }
        .contact_2{
            display: flex;
        }
        .top{
        }
        .content{
            width: 85%;
        }
        .title{
            font-size: 36px;
        }
        .subText{
            font-size: 14px;
            overflow-wrap: break-word;
        }
        .subTextForPC{
            display: none;
        }
        .subTextForMobile{
            display: block;
        }
        .carousel{
            width: 100%;
            margin-top: 50px;
        }
        .carousel :deep(.el-carousel__container) {
            width: 100%;
            height: 108px;
        }
        .developer{
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .developer_content{
            height: auto;
        }
        .developer_title{
            font-size: 20px;
            height: 48px;
            line-height: 48px;
        }
        .developer_img{
            width: 100px;
            height: 100px;
            border-radius: 100px;
            overflow: hidden;
        }
        .developer_intro_box{
            width: calc(100% - 160px);
            height: 230px;
        }
        .developer_name{
            font-size: 16px;
        }
        .developer_detail{
            font-size: 12.5px;
            height: 150px;
            line-height: 1.75;
            overflow-y:scroll;
        }
        .transition_detail{
            line-height: 1.75;
            font-size: 12.5px;
            overflow-y:scroll;
            text-align: justify;
        }
        .skill{
            padding-bottom: 0px;
        }
        .skill_title{
            font-size: 20px;
        }
        .skill_box_wrapper{
            flex-wrap: wrap;
        }
        .skill_box{
            width: 95%;
            margin-bottom: 20px;
        }
        .skill_box_title{
            font-size: 16px;
        }
        .skill_box_subText{
            font-size: 12.5px;
        }
        .feedback_title{
            font-size: 20px;
        }
        .feedback_subText{
            font-size: 12.5px;
        }
        .feedback_box{
            width: 100%;
        }
        .feedback_box_2{
            margin-top: 20px;
        }
        .footer{
            height: 80px;
            font-size: 12px;
        }
        .footer_item{
            line-height: 1.75;
        }
    }
</style>