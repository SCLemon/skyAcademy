<template>
  <div class="pdf-wrapper">
    <div class="pdf-loading" ref="pdf-loading" v-if="isLoading">
      <div>
        <img src="img/Loading.gif">
        <div class="loadingBar">
          <div class="loadingLine" :style="`width: ${loadProgress}%;`"></div>
        </div>
        <div class="loadProgress">{{ loadProgress }}%</div>
      </div>
    </div>
    <div ref="pdfContainer" class="pdf-container"></div>
  </div>
</template>

<script>
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

export default {
  name: 'PdfViewer',
  props: {
    pdfUrl: {
      type: String,
      required: true
    },
    httpHeaders:{
      type: Object,
      default: {}
    },
    preloadCount:{
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      isLoading: true,
      loadProgress:0,
      loadTimer: null,
      pdf: null,
      pageCache: new Map(),
      pageCanvases: [],
      observer: null,
    };
  },
  mounted() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    pdfjsLib.disableStream = false;
    pdfjsLib.enableWebGL = this.isWebGLAvailable(); // GPU 渲染加速
    
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    clearInterval(this.heapWatcher)
  },
  methods: {
    // 判斷瀏覽器是否支援 WebGL
    isWebGLAvailable() {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch (e) {
        return false;
      }
    },
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
    async loadPdf() {
      this.isLoading = true;
      this.$bus.$emit('toggleEnableToReadNextPDF',false);
      
      // 銷毀舊 PDF 解析器與 worker
      if (this.pdf) this.pdf.destroy();

      const container = this.$refs.pdfContainer;
      container.innerHTML = '';
      this.pageCanvases = [];

      try {

        const loadingTask = pdfjsLib.getDocument({
          url: this.pdfUrl,
          httpHeaders: this.httpHeaders,
          verbosity: pdfjsLib.VerbosityLevel.ERRORS,
        });

        // 下載進度條
        loadingTask.onProgress = (progressData) => {
          const { loaded, total } = progressData;
          const percent = Math.round((loaded / total) * 100);
          this.loadProgress = percent;
        };

        this.pdf = await loadingTask.promise;

        // 進行結構渲染 --> 利用 div 先替代 canvas 避免內存爆滿。
        for (let pageNum = 1; pageNum <= this.pdf.numPages; pageNum++) {
          const placeholder = document.createElement('div');
          placeholder.dataset.pageNum = pageNum;
          placeholder.style.display = 'block';
          placeholder.style.marginTop = '5px';
          placeholder.style.marginBottom = '5px';
          placeholder.style.minHeight = '100vh';
          container.appendChild(placeholder);
          this.pageCanvases.push({ pageNum, canvas: placeholder, renderTask: null });
        }

        // 提前渲染第一頁
        const first = this.pageCanvases.find(p => p.pageNum === 1);
        if (first && !first.canvas.dataset.rendered) {
          this.safeRenderPage(first.pageNum, first.canvas);
        }
        
        // 後處理
        await this.delay(750);
        this.$refs['pdf-loading'].style = 'opacity:0;';
        await this.delay(750); // 需等待 opacity 動畫的 0.75s

        this.initObserver();
        this.isLoading = false;
        this.$bus.$emit('toggleEnableToReadNextPDF',true);
      } 
      catch (err) {}
    },
    initObserver() {
      if (this.observer) this.observer.disconnect();

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const pageNum = parseInt(entry.target.dataset.pageNum);
            const pageObj = this.pageCanvases.find(p => p.pageNum === pageNum);
            if (!pageObj || !this.pdf) return;

            // 頁面進入視窗（且還沒渲染過）
            if (entry.isIntersecting && !entry.target.dataset.rendered) {
              this.safeRenderPage(pageNum, entry.target);

              // 🔹 預載下一頁
              for (let i = 1; i <= this.preloadCount; i++) {
                const next = this.pageCanvases.find(p => p.pageNum === pageNum + i);
                if (next && !next.canvas.dataset.rendered) {
                  this.safeRenderPage(next.pageNum, next.canvas);
                }
              }

              // 釋放資源
              this.pageCanvases.forEach((p) => {
                if (p.canvas.dataset.rendered && Math.abs(p.pageNum - pageNum) > (this.preloadCount + 1)) {
                  this.releaseCanvasElement(p);
                }
              });
            }
          });
        },
        { root: this.$refs.pdfContainer, threshold: 0.01 }
      );

      this.pageCanvases.forEach(({ canvas }) => {
        this.observer.observe(canvas);
      });
    },
    // 釋放 Canvas 資源佔用
    releaseCanvasElement(pageObj) {
      const oldCanvas = pageObj.canvas;

      // 清除畫面內容
      const ctx = oldCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, oldCanvas.width, oldCanvas.height);

      oldCanvas.width = 0;
      oldCanvas.height = 0;

      const placeholder = document.createElement('div');
      placeholder.dataset.pageNum = pageObj.pageNum;
      placeholder.style.display = 'block';
      placeholder.style.marginTop = '5px';
      placeholder.style.marginBottom = '5px';
      placeholder.style.minHeight = '100vh';
      placeholder.style.boxSizing = 'border-box';

      oldCanvas.replaceWith(placeholder);

      pageObj.canvas = placeholder;
      delete placeholder.dataset.rendered;

      this.observer.observe(placeholder);
    },
    // 進行頁面渲染
    async safeRenderPage(pageNum, placeholderEl) {
      const pageObj = this.pageCanvases.find(p => p.pageNum === pageNum);
      
      if (!pageObj || !this.pdf) return;
      if (pageObj.renderTask) {
        pageObj.renderTask.cancel();
      }
      
      // cache 緩存頁面
      let page = this.pageCache.get(pageNum);
      if (!page) {
        page = await this.pdf.getPage(pageNum);
        this.pageCache.set(pageNum, page);
        
        // 清除舊頁面資料
        if (this.pageCache.size > 20) {
          const oldest = this.pageCache.keys().next().value;
          this.pageCache.delete(oldest);
        }
      }
      
      // 💡 建立 canvas 並替換 placeholder
      const canvas = document.createElement('canvas');
      canvas.style.display = 'block';
      canvas.style.marginTop = '5px';
      canvas.style.marginBottom = '5px';
      canvas.dataset.pageNum = pageNum;
      placeholderEl.replaceWith(canvas);
      pageObj.canvas = canvas;
    
      // 開始繪圖
      const containerWidth = this.$refs.pdfContainer.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      const qualityFactor = 1.75;

      const viewport = page.getViewport({ scale: 1 });
      const scale = (containerWidth / viewport.width) * dpr * qualityFactor;
      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${(scaledViewport.height / scaledViewport.width) * containerWidth}px`;
      canvas.style.border = '0.5px solid rgba(0,0,0,0.15)'
      canvas.style.boxSizing = 'border-box'

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 建立 renderTask 並保存
      pageObj.renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport });

      try {
        await pageObj.renderTask.promise;
        canvas.dataset.rendered = true;
      } 
      catch (e) {} 
      finally {
        pageObj.renderTask = null; // render 完成後清除
      }
    },
    handleResize() {
      const container = this.$refs.pdfContainer;
      if (!this.pdf || !container) return;

      this.pageCanvases.forEach(({ pageNum, canvas }) => {
        if (!canvas.dataset.rendered) return; 
        this.safeRenderPage(pageNum, canvas);
      });
    }
  },
  watch: {
    async pdfUrl(newUrl) {
      this.loadProgress = 0;
      this.pageCache = new Map();
      this.pdfUrl = newUrl
      await this.loadPdf();
    }
  }
};
</script>

<style scoped>

  .pdf-wrapper{
    width: 100%;
    height: 100%;
    position: relative;
  }
  .pdf-container{
    width: 100%;
    height: 100vh;
    overflow: auto;
  }
  .pdf-loading{
    position: absolute;
    top:0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
    transition: 0.75s opacity ease;
  }
  .loadingBar{
    width: 100%;
    height: 9.5px;
    border: 1px solid skyblue;
    box-sizing: border-box;
    padding: 1px;
  }
  .loadingLine{
    width: 0%;
    height: 5.5px;
    background: skyblue;
    transition: 0.25s width ease;
    box-sizing: border-box;
  }
  .loadProgress{
    width: 100%;
    margin-top: 10px;
    text-align: center;
    color: skyblue;
  }
</style>
