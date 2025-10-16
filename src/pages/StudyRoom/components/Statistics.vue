<template>
  <div class="canvas_wrapper">
    <canvas id="chart" class="chart"></canvas>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto'
export default {
    name:'Statistics',
    mounted(){
        this.renderChart()
    },
    methods:{
        renderChart(userData){
            const ctx = document.getElementById('chart');
            const labels = ['10/1', '10/2', '10/3', '10/4', '10/5', '10/6', '10/7']
            const data = {
                labels: labels,
                datasets: [{
                    label: '學習曲線圖',
                    data: [65, 20, 50 ,40, 70 ,100, 25],
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }],
            };
            new Chart(ctx, {
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
        box-shadow: 0px 1px 5px gray;
        border-radius: 1px;
    }
    canvas {
        width: 100% !important;
        margin: 0 auto;
        height: 330px !important;
    }
</style>