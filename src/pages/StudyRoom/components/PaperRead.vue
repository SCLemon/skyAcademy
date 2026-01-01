<template>
  <div class="paperRead_wrapper">
    <div class="paperRead_top">
        <div class="paperRead_title"> <i class="el-icon-reading" style="margin-right: 5px;"></i> Paper Reading</div>
        <div class="paperRead_add" v-if="showOption" @click="add()"><i class="el-icon-plus"></i></div>
    </div>
    <div class="paperRead_list" v-if="record.length">
        <div class="paperRead_list_item" v-for="(obj, id) in record" :key="id" @click="showOption?deleteRecord(obj.idx):''">
            <div class="paperRead_list_item_index">{{ id + 1 }}.</div>
            <div class="paperRead_list_item_name">{{ obj.name }}</div>
        </div>
    </div>
    <div class="paperRead_list_empty" v-else>
        <el-empty description="暫無數據"></el-empty>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsCookie from 'js-cookie';
export default {
    name:'PaperRead',
    data(){
        return {
            record:[],
            showOption: false,
        }
    },
    async mounted(){
        await this.getRecord();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if(currentUser.typeEng == 'teacher') this.showOption = true;
    },
    methods:{
        async add(){
            try{
                const { value }  = await this.$prompt('請輸入論文名稱', '新增閱讀紀錄', {
                    confirmButtonText: '確定',
                    cancelButtonText: '取消',
                })
                const res = await axios.post('/api/paperRecord/add',{
                        name: value
                },
                {
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    }
                });
                if(res.data.type == 'success'){
                    await this.getRecord();
                }
                this.$bus.$emit('handleAlert','論文紀錄通知', res.data.message, res.data.type);
            }
            catch(e){}
        },
        async getRecord(){
            const res = await axios.get('/api/paperRecord/getRecord',{
                headers:{
                    'x-user-token':jsCookie.get('authToken')
                }
            });
            if(res.data.type == 'success'){
                this.record = res.data.record;
            }
        },
        async deleteRecord(idx){
            try{
                await this.$confirm('此操作將永久刪除閱讀紀錄, 是否繼續？', '提示', {
                    confirmButtonText: '確認',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                const res = await axios.delete(`/api/paperRecord/delete/${idx}`,{
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    }
                });
                if(res.data.type == 'success'){
                    await this.getRecord();
                }
                this.$bus.$emit('handleAlert','論文紀錄通知', res.data.message, res.data.type);
            }
            catch(e){}
        }
    }
}
</script>

<style scoped>
    .paperRead_wrapper{
        height: 370px;
        box-sizing: border-box;
        overflow: hidden;
        box-shadow: 0px 1px 4px gray;
    }
    .paperRead_top{
        width: 100%;
        height: 50px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        box-sizing: border-box;
        padding-left: 15px;
        padding-right: 10px;
        display: flex;
        align-items: center;
    }
    .paperRead_title{
        line-height: 50px;
        color: rgb(144, 147, 153);
    }
    .paperRead_add{
        height: 30px;
        width: 30px;
        line-height: 30px;
        text-align: center;
        margin-left: auto;
        border-radius: 30px;
        transition: 0.3s background ease;
    }
    .paperRead_add:hover{
        cursor: pointer;
        background: rgba(0,0,0,0.05);
    }
    .paperRead_list{
        width: 100%;
        height: calc(100% - 50px);
        box-sizing: border-box;
        overflow-y: scroll;
    }
    .paperRead_list_item{
        width: 100%;
        height: 50px;
        font-size: 14px;
        margin: 0 auto;
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }
    .paperRead_list_item:hover{
        cursor: pointer;
        box-shadow: 0px 1px 4px rgba(0,0,0,0.25);
    }
    .paperRead_list_item_index{
        width: 25px;
        padding-left: 3px;
        padding-right: 3px;
        margin-left: 10px;
        height: 50px;
        line-height: 50px;
    }
    .paperRead_list_item_name{
        width: calc(100% - 35px);
        height: auto;
        padding-left: 10px;
        padding-right: 10px;
        align-items: center;
        box-sizing: border-box;
        line-height: 20px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
    }
    .paperRead_list_empty{
        width: 100%;
        height: calc(100% - 50px);
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>