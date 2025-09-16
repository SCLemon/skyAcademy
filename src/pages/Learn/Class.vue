<template>
  <div class="view">
    <div class="box">
        <div class="pdf">
            <pdf-viewer pdfUrl="/api/learn/content"></pdf-viewer>
        </div>
        <div class="list"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsCookie from 'js-cookie';
import pdfViewer from './components/pdfViewer.vue';
export default {
    name:'Class',
    components:{
        pdfViewer
    },
    data(){
        return {
            currentUser:{},
            courseIdx:this.$route.query.idx,
        }
    },
    async mounted(){
        // await this.getData();
        this.currentUser = this.$bus.$currentUser
    },
    methods:{

    }
}
</script>

<style scoped>
    .view{
        width: calc(100vw - 250px);
        height: 100vh;
    }
    .box{
        width:100%;
        display: flex;
        height: 100vh;
    }
    .pdf{
        width: calc(100% - 250px);
        height: 100vh;
        box-sizing: border-box;
    }
    .list{
        width: 250px;
        height: 100vh;
        background-color: black;
    }
</style>