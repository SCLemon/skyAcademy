<template>
    <div class="post_img_box_wrapper">
        <div class="post_img_box" v-if="postImg.length" :style="{ aspectRatio }" ref="post_img_box" @scroll="onScroll()">
            <div class="previous_button button" @click.stop="goPreviousPostImage(index)" v-if="hasPrevious">
                <i class="el-icon-arrow-left"></i>
            </div>
            <div class="post_img" v-for="(item) in postImg" :key="item.url"  @click="clickToShowImgDetail ? showPostImgDetail(item.url) : null">
                <img :data-src="item.url" v-lazy decoding="async" alt="" :style="item.style" @load="transformImg(item, $event)">
            </div>
            <div class="next_button button" @click.stop="goNextPostImage(index)" v-if="hasNext">
                <i class="el-icon-arrow-right"></i>
            </div>
        </div>
        <div class="post_img_currentIndex" v-if="postImg.length > 1">
            <div :class="{post_img_currentIndex_item:true, post_img_currentIndex_item_selected: id === index}" v-for="(item,id) in postImg" :key="id"></div>
        </div>
    </div>
</template>

<script>

export default {
    name:'Carousel',
    props: {
        postImg:{
            type: Array,
            default(){
                return []
            }
        },
        aspectRatio:{
            type: Number,
            default: 16/9
        },
        clickToShowImgDetail:{
            type: Boolean,
            default: true
        }
    },
    data(){
        return{
            index:0,
            scrollTimer: null,
        }
    },
    computed: {
        hasNext(){
            return this.index < this.postImg.length - 1;
        } ,
        hasPrevious(){
            return this.index > 0;
        },
    },
    methods:{
        // 圖片偏移量
        transformImg(p, e){
            
            const showWidth = e.target.parentNode.clientWidth;
            const referWidth = p?.position?.referWidth || showWidth;

            const factor = showWidth / referWidth;

            const pos = p.position || {};

            const scale = pos.scale ?? 1;
            const offsetX = (pos.x ?? 0) * factor;
            const offsetY = (pos.y ?? 0) * factor;


            this.$set(p, 'style', {
                transform: `translate(${-offsetX}px, ${-offsetY}px) scale(${scale})`,
                transformOrigin: 'top left',
            });
            e.target.parentNode.style.backgroundImage = 'none';
            
        },
        onScroll(){
            clearTimeout(this.scrollTimer);
                this.scrollTimer = setTimeout(() => {
                const box = this.$refs.post_img_box;
                const width = box.clientWidth;
                this.index = Math.round(box.scrollLeft / width);
            }, 50);
        },
        showPostImgDetail(imgUrl){
            if(/Mobi|Android|iPhone/i.test(navigator.userAgent) || window.innerWidth <= 440) return
            let url = location.protocol+'//'+location.host + imgUrl;
            window.open(url, '_blank')
        },

        goNextPostImage(index) {
            const imgs = this.$el.querySelectorAll('.post_img');
            const next = imgs[index + 1]
            if (next) {
                next.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
            }
        },
        goPreviousPostImage(index) {
            const imgs = this.$el.querySelectorAll('.post_img');
            const previous = imgs[index - 1]
            if (previous) {
                previous.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
            }
        }
    }
}
</script>

<style scoped>
    .post_img_box_wrapper{
        position: relative;
        height: auto;
        width: 100%;
        margin-bottom: 2px;
    }
    .post_img_box{
        height: auto;
        /* aspect-ratio: 16 / 9; */
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        background: black;
    }
    .post_img{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        box-sizing: border-box;
        margin: 0 auto;
        overflow: hidden;
        position: relative;
        background-image: url(../../public/img/Loading.gif);
        background-repeat: no-repeat;
        background-position: center;
    }
    .post_img:hover{
        cursor: pointer;
    }
    .post_img img{
       width: 100%;
       display: block;
       background: black;
    }
    .button{
        position: absolute;
        width: 40px;
        height: 40px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        border-radius: 40px;
        transition: 0.5s opacity;
        background: rgba(0,0,0,0.08);
        opacity: 0;
        color: white;
        font-weight: bolder;
    }
    .button:hover{
        cursor: pointer;
    }
    .post_img_box_wrapper:hover .button{
        opacity: 1;
    }

    .previous_button{
        left: 20px;
    }
    .next_button{
        right: 20px;
    }
    .post_img_currentIndex{
        width: auto;
        max-width: 212.5px;
        overflow-x: scroll;
        height: auto;
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
    }
    .post_img_currentIndex_item{
        width: 30px;
        height: 1.6px;
        background: rgba(255,255,255,0.3);
        margin-right: 6.5px;
        box-sizing: border-box;
    }
    .post_img_currentIndex_item_selected{
        background: rgba(255,255,255,1);
    }
    
    @media screen and (max-width: 440px) {
        .post_img_box{
            max-height: calc((100vw) * 0.6) !important;
        }
        .post_img_box{
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
        }
        .post_img{
            scroll-snap-align: center;
        }
        .button{
            display: none;
        }
    }
</style>