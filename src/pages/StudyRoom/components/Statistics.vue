<template>
  <div class="canvas_wrapper">
    <canvas id="chart" class="chart"></canvas>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto'
import axios from 'axios';
import jsCookie from 'js-cookie';
export default {
    name:'Statistics',
    mounted(){
        this.getData();
        this.$bus.$on('refreshStudyRecordStatistics', this.getData)
    },
    data(){
        return {
            chartInstance :null,
        }
    },
    methods:{
        async getData(){
            try{
                const res = await axios.get('/api/studyRecord/getStatistics',{
                    headers:{
                    'x-user-token':jsCookie.get('authToken')
                }
            })
            if(res.data.type == 'success'){
                this.renderChart(res.data.record)
            }
            else this.$bus.$emit('handleAlert','資料汲取通知',res.data.message, res.data.type)
            }
            catch(e){
                console.log(e)
            }
        },
        renderChart(userData){
            const ctx = document.getElementById('chart');
            const labels = userData.dateArr
            const data = {
                labels: labels,
                datasets: [{
                    label: '學習曲線圖',
                    data: userData.totalArr,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }],
            };

            if (this.chartInstance) {
                this.chartInstance.destroy();
            }

            this.chartInstance = new Chart(ctx, {
                type: 'line', 
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x:{
                            grid: { display: false, drawBorder: false },
                        },
                        y: {
                            grid: { display: false, drawBorder: false },
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },
    beforeDestroy(){
        this.$bus.$off('refreshStudyRecordStatistics', this.getData);
        

        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }

        const canvas = document.getElementById('chart');
        if (canvas) {
            canvas.width = 0;
            canvas.height = 0;
        }
    }
    
}
</script>

<style scoped>
    .canvas_wrapper{
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
        margin: 0 auto;
        box-shadow: 0px 1px 4px gray;
        border-radius: 1px;
        transition: 1s box-shadow ease;
    }
    .canvas_wrapper:hover{
        cursor: pointer;
        box-shadow: 0px 5px 8px rgba(0,0,0,0.3);
    }
    canvas {
        width: 100%;
        margin: 0 auto;
        height: 330px !important;
    }
    @media screen and (max-width: 440px) {
        .canvas_wrapper{
            box-shadow: none;
            padding:0;
            padding-left: 3px;
            padding-right: 3px;
        }
        .canvas_wrapper:hover{
            box-shadow: none;
        }
        canvas{
            height: 273px !important;
        }
    }
</style>