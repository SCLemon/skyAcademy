<template>
  <div class="box">
    <div class="title">版主介紹</div>
    <div class="userImg"></div>
    <div class="name">
        <div class="name_chinese">林英豪</div>
        <div class="name_Englist">YING-HAO, LIN</div>
    </div>
    <div class="contact">
        <div class="contact_item" title="Gmail" @click="copy('Gmail 信箱地址複製通知','blc0000421@gmail.com')"><i class="fa-solid fa-envelope"></i></div>
        <div class="contact_item" title="Resume" @click="openLink('https://www.cake.me/blc0000421')"><i class="fa-solid fa-file-lines"></i></div>
        <div class="contact_item" title="GitHub" @click="openLink('https://github.com/SCLemon')"><i class="fa-brands fa-github"></i></div>
        <div class="contact_item" title="LinkedIn" @click="openLink('https://www.linkedin.com/in/sclemon1013/')"><i class="fa-brands fa-linkedin"></i></div>
        <div class="contact_item" title="個人網站" @click="copy('個人網站網址複製通知','https://sclemon1013.com/')"><i class="fa-solid fa-earth-americas"></i></div>
    </div>
   <div class="detail">
        <div class="part">
            <div class="part_title">學歷</div>
            <div class="part_detail">國立清華大學半導體研究學院 <span style="font-weight: bolder;">碩士*</span></div>
            <div class="part_detail">國立清華大學工程與系統科學系 <span style="font-weight: bolder;">學士</span></div>
        </div>
        <div class="part">
            <div class="part_title">研究領域</div>
            <div class="part_detail">前瞻半導體二維材料元件設計</div>
        </div>
        <div class="part">
            <div class="part_title">工作經驗</div>
            <div class="work_name">國家高速網路與計算中心 <div class="work_time">202507-202509</div></div>
            <div class="work_title">大數據服務研發工程師（實習）</div>
            <div class="work_name">國家高速網路與計算中心 <div class="work_time">202407-202507</div></div>
            <div class="work_title">PINNs 前端開發工程師（實習）</div>
        </div>
        <div class="part">
            <div class="part_title">自我簡介</div>
            <div class="part_personal_intro">我平時熱衷於鑽研電子電路與人工智慧應用，也喜歡透過專案實作培養解決問題的能力。在探索新知的過程中，我深刻體會到<span style="font-weight: bolder;">「誠信」</span>的重要性，因為唯有誠信才能讓團隊彼此信任，讓創新成果被業界與客戶認可。我希望未來能以專業結合誠懇態度，在半導體產業持續貢獻與成長。</div>
        </div>
   </div>
  </div>
</template>

<script>
export default {
    name:'SelfIntro',
    methods:{
        openLink(url){
            window.open(url, '_blank');
        },
        copy(title, url){
            try{
                navigator.clipboard.writeText(url);
                this.$bus.$emit('handleAlert',title,'已複製至剪貼簿','success')
            }
            catch(e){
                this.$bus.$emit('handleAlert',title,`複製失敗，請手動複製網址 ${url}`,'error')
            }
        }
    }
}
</script>

<style scoped>
    .box{
        width: 310px;
        min-height: 718px;
        height: calc(100vh - 40px);
        box-shadow: 0px 1px 4px rgba(0,0,0,0.3);
        transition: all 1s ease;
        box-sizing: border-box;
        padding-top: 20px;
        padding-bottom: 15px;
        overflow: hidden;
    }
    .box:hover{
        cursor: pointer;
        box-shadow: 0px 5px 8px rgba(0,0,0,0.3);
    }
    .title{
        width: 100%;
        padding-left: 20px;
        margin-bottom: 15px;
        font-weight: bolder;
        font-size: 18px;
    }
    .userImg{
        height: 200px;
        background-image: url(../../../../public/img/author2.jpg);
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
    }
    .contact{
        width: 100%;
        height: 45px;
        margin-top: 5px;
        margin-bottom: 5px;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .contact_item{
        width: 45px;
        height: 45px;
        line-height: 45px;
        text-align: center;
        font-size: 18px;
        margin-right: 5px;
    }
    .contact_item:hover{
        cursor: pointer;
        background-color: #f0f0f0;
    }
    .detail{
        width: 100%;
        min-height: 360px;
        height: calc(100vh - 420px);
        box-sizing: border-box;
        overflow-y: scroll;
        padding-bottom: 10px;
    }
    
    .name{
        width: 100%;
        text-align: center;
        margin-top: 15px;
        line-height: 1.5;
        font-size: 18px;
        font-weight: bolder;
    }
    .part{
        width: 100%;
        padding-left: 20px;
        padding-right: 20px;
        box-sizing: border-box;
    }
    .part_title{
        font-weight: bolder;
        font-size: 18px;
        box-sizing: border-box;
        margin-bottom: 12px;
        margin-top: 12px;
    }
    .part_detail{
        line-height: 1.5;
    }
    .work_name{
        height: 24px;
        line-height: 24px;
    }
    .work_time{
        font-size: 11px;
        height: 24px;
        display: inline-block;
        line-height: 24px;
        color:rgba(0,0,0,0.3);
    }
    .work_title{
        line-height: 32px;
        height: 32px;
        font-weight: bold;
    }
    .part_personal_intro{
        text-align: justify;
        line-height: 1.5;
        font-size: 14px;
    }

</style>