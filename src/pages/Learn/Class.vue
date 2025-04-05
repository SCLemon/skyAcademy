<template>
  <div class="view">
    <div class="videoBox">
        <div class="video">
            <iframe width="860" height="483.75"
                src="https://www.youtube.com/embed/ruXoiCjdMNY?si=NY4zQc1drWMv3tNk&modestbranding=1&rel=0&controls=1&showinfo=0"
                title="YouTube video player" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
            </iframe>
            <div class="title">線性代數（上）-極限微分之微妙解法</div>
            <div class="abstract">這門課程介紹線性代數的基本概學導技巧。透過實門課程技巧。透過實例課程介紹線性代數的基點，深入探討向量空間中的變化與推導技巧。透過實例課程介紹線性代數的基本概念，並以「極限與微分」為切入點，深入探討向量空間中的變化與推導技巧。透過實例課程介紹線性代數的基本概念，並以「極限與微分」為切入點，深入探討向量空間中的變化與推導技巧。透過實例課程介紹線性代數的基本概念，並以「極限與微分」為切入點，深入探討向量空間中的變化與推導技巧。透過實例解析，帶你掌握微分在多維空間中的幾何意涵，揭開線性轉換與導數之間的微妙關聯。適合打好數學基礎、準備進階工程與科學應用的學生。備進階工程與科學應用的學生。這門課程介紹線性代數的基本概念，並以「極限與微分」為切入點，深入探討向量空間中的變化與推導技巧。透過實例解析，帶你掌握微分在多維空間中的幾何意涵，揭開線性轉換與導數之間的微妙關聯。適合打好數學基礎、準備進階工程與科學應用的學生。</div>
            
            <div class="attachmentBox">
                教材檔案下載： <a href="" class="downloadLink">點擊下載</a>
            </div>
        </div>
        <div class="videoList">
            <div class="videoList_title">
                <div>上課教材</div>
                <div class="video_add_btn"><el-button type="primary">上傳<i class="el-icon-upload el-icon--right"></i></el-button></div>
            </div>
            <div class="videoList_item_box">
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
                <div class="videoList_item">教材一：線性代數（上）-極限微分之微妙解法 <i class="fa-solid fa-pen pen"></i></div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
export default {
    name:'Class'
}
</script>

<style scoped>
    .view{
        width: calc(100vw - 250px);
        height: 100vh;
    }
    .videoBox{
        width: 100%;
        height: 100vh;
        box-sizing: border-box;
        padding-top: 15px;
        display: flex;
        justify-content: space-evenly;
    }
    .video{
        width: 860px;
        height: 483.75px;
    }
    .title{
        width: 100%;
        height: 60px;
        line-height: 60px;
        font-weight: bolder;
        font-size: 18px;
        box-sizing: border-box;
        white-space: nowrap;       
        overflow: hidden;           
        text-overflow: ellipsis; 
    }
    .abstract{
        width: 100%;
        height: auto;
        font-size: 14px;
        line-height: 1.5;
        max-height: 157px;
        overflow-y: scroll;
        margin-bottom: 20px;
        background: rgba(0,0,0,0.05);
        box-sizing: border-box;
        border-radius: 5px;
        padding: 5px;
    }
    .downloadLink{
        text-decoration: none;
        color: blue;
    }
    .downloadLink:hover{
        text-decoration: underline;
    }
    .videoList{
        width: 280px;
        height: 100%;
        box-sizing: border-box;
        overflow-y: scroll;
    }
    .videoList_title{
        width: 95%;
        height: 60px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        padding-left: 10px;
        padding-right: 10px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    .video_add_btn{
        margin-left: auto;
    }
    .videoList_item_box{
        width: 100%;
        height: calc(100% - 60px);
        overflow-y: scroll;
    }
    .videoList_item{
        width: 95%;
        height: 60px;
        line-height: 60px;
        margin: 0 auto;
        padding-left: 10px;
        padding-right: 10px;
        white-space: nowrap;       
        overflow: hidden;           
        text-overflow: ellipsis;  
        box-sizing: border-box;  
        position: relative;
    }
    .pen{
        position: absolute;
        top:5px;
        right:5px;
        font-size: 10px;
    }
    .pen:hover{
        cursor: pointer;
    }
</style>