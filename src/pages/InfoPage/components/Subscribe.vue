<template>
  <el-button v-if="!isSubscribed" type="warning" :loading="isloading" icon="el-icon-message-solid" @click="requestSubscribe()">裝置訂閱</el-button>
</template>

<script>
import { checkSubscribed, subscribe } from '@/service-worker/main';
export default {
    name:'Subscribe',
    data(){
        return{
            isloading: false,
            isSubscribed: true,
        }
    },
    mounted(){
        this.checkIfSubscribed();
    },
    methods:{
        async checkIfSubscribed(){
            this.isSubscribed = await checkSubscribed();
        },
        async requestSubscribe(){
            try{
                this.isloading = true;

                const result = await subscribe();
                
                this.$bus.$emit('handleAlert','消息訂閱通知', result.message, result.type)
            
            }
            catch(e){

            }
            finally{
                await this.checkIfSubscribed();
                this.isloading = false;
            }
        }
    }
}
</script>

<style scoped>

</style>