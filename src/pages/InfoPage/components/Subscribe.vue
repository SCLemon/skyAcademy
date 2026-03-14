<template>
  <el-button type="warning" :loading="isloading" icon="el-icon-message-solid" @click="requestSubscribe()">裝置訂閱</el-button>
</template>

<script>
import { subscribe } from '@/service-worker/main';
export default {
    name:'Subscribe',
    data(){
        return{
            isloading: false,
        }
    },
    mounted(){
    },
    methods:{
        async requestSubscribe(){
            try{
                this.isloading = true;

                const result = await subscribe();
                
                this.$bus.$emit('handleAlert','消息訂閱通知', result.message, result.type)
            
            }
            catch(e){

            }
            finally{
                this.isloading = false;
            }
        }
    }
}
</script>

<style scoped>

</style>