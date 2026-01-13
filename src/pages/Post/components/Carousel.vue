<template>
    <div class="post_img_box_wrapper">
        <div class="post_img_box" v-if="postImg.length">
            <div class="previous_button button" @click="goPreviousPostImage(index)" v-if="hasPrevious">
                <i class="el-icon-arrow-left"></i>
            </div>
            <div class="post_img" v-for="(item,id) in postImg" :key="id" @click="showPostImgDetail(item.url)">
                <img src="img/Loading.gif" :data-src="item.url" v-lazy alt="">
            </div>
            <div class="next_button button" @click="goNextPostImage(index)" v-if="hasNext">
                <i class="el-icon-arrow-right"></i>
            </div>
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
    },
    data(){
        return{
            index:0,
        }
    },
    computed: {
        hasNext(){
            return this.index < this.postImg.length - 1;
        } ,
        hasPrevious(){
            return this.index > 0;
        }
    },
    methods:{

        showPostImgDetail(imgUrl){
            let url = location.protocol+'//'+location.host + imgUrl;
            window.open(url, '_blank')
        },

        goNextPostImage(index) {
            const imgs = this.$el.querySelectorAll('.post_img');
            const next = imgs[index + 1]
            if (next) {
                next.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
                this.index = ++index;
            }
        },
        goPreviousPostImage(index) {
            const imgs = this.$el.querySelectorAll('.post_img');
            const previous = imgs[index - 1]
            if (previous) {
                previous.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
                this.index = --index;
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
    }
    .post_img_box{
        height: auto;
        max-height: calc((100vw - 250px) * 0.3) !important;
        padding-top: 5px;
        padding-bottom: 5px;
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 100%;
        grid-template-rows: 1fr;
        overflow-x: auto;
        overflow-y: hidden;
    }

    .post_img{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }

    .post_img:hover{
        cursor: pointer;
    }
    .post_img>img{
        max-width: 100%;
        object-fit: contain;
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
</style>