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
    },
    contextLayer:{
      type: Boolean,
      default: true,
    },
    fakeLoadingProgress:{ // 避免 chrome 的渲染機制問題
      type: Boolean,
      default: false,
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
      resizeTimer: null,
    };
  },
  mounted() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    pdfjsLib.disableStream = false;
    pdfjsLib.enableWebGL = this.isWebGLAvailable(); // GPU 渲染加速
    
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.observer) this.observer.disconnect();
    this.cleanAll();
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

    // 清除所有佔用資源
    cleanAll(){
      this.pageCanvases.forEach((p) => {     
        if (p.renderTask) {
          try { 
            p.renderTask.cancel(); 
          } 
          catch {}
          p.renderTask = null;
        }

        const canvas = p.canvasWrapper?.querySelector?.('canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = 0;
          canvas.height = 0;
          p.canvasWrapper.removeChild(canvas);
        }

        const page = this.pageCache.get(p.pageNum);
        if (page?.cleanup) {
          try { 
            page.cleanup(); 
          } 
          catch {}
        }
      });

      this.pageCache.clear();
      this.pageCanvases = [];

      if (this.pdf) {
        try {
          this.pdf.cleanup?.();
          this.pdf.destroy?.();
        } catch (e) {
          console.warn('PDF destroy error', e);
        }
        this.pdf = null;
      }
      const container = this.$refs.pdfContainer;
      if (container) container.innerHTML = '';

      console.log('All PDF resources released');

    },

    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    // 下方為渲染函式區
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

        },);

        // 下載進度條(偽進度條)
        if(this.fakeLoadingProgress){
          this.loadTimer = setInterval(() => {
            if(this.loadProgress < 90){
              const step = Math.random() * 5;
              this.loadProgress += Math.min(Math.floor(step),90);
            }
          }, 75);
        }

        loadingTask.onProgress = (progressData) => {
          const { loaded, total } = progressData;
          const percent = Math.min(Math.round((loaded / total) * 100), 100);
          this.loadProgress = percent;
          clearInterval(this.loadTimer)
        };

        this.pdf = await loadingTask.promise;

        // 進行結構渲染 --> 利用 div 先替代 canvas 避免內存爆滿。
        await this.buildPageWrappers();

        // 提前渲染
        for (let i = 1; i <= this.preloadCount; i++) {
          const next = this.pageCanvases.find(p => p.pageNum === i);
          if (next && !next.canvasWrapper.dataset.rendered) {
            await this.safeRenderPage(next.pageNum, next.canvasWrapper);
          }
        }
        
        // 後處理
        await this.delay(500);
        this.$refs['pdf-loading'].style = 'opacity:0;';
        await this.delay(500); // 需等待 opacity 動畫的 0.5s

        this.initObserver();
        this.isLoading = false;
        this.$bus.$emit('toggleEnableToReadNextPDF',true);
      } 
      catch (err) {}
    },
    async buildPageWrappers() {

      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

      let batchSize;
      if (isMobile) batchSize = 4;  // 穩定優先
      else batchSize = navigator.hardwareConcurrency > 8 ? 10 : 8;

      const container = this.$refs.pdfContainer;
      const total = this.pdf.numPages;

      for (let i = 1; i <= total; i += batchSize) {

        const batch = [];

        for (let j = i; j < i + batchSize && j <= total; j++) {
          batch.push(this.pdf.getPage(j));
        }

        const pages = await Promise.all(batch);

        // 依照個別頁面的比例建置對應的容器
        pages.forEach((page, index) => {
          const pageNum = i + index;

          const viewport = page.getViewport({ scale: 1 });
          const ratio = viewport.height / viewport.width;

          const canvasWrapper = document.createElement('div');
          canvasWrapper.dataset.pageNum = pageNum;
          canvasWrapper.style.display = 'block';
          canvasWrapper.style.marginTop = '5px';
          canvasWrapper.style.marginBottom = '5px';
          canvasWrapper.style.width = '100%';
          canvasWrapper.style.aspectRatio = `1 / ${ratio}`;

          container.appendChild(canvasWrapper);

          this.pageCanvases.push({
            pageNum,
            canvasWrapper,
            renderTask: null
          });

          page.cleanup();
        });

        // 小延遲等下一個 event loop tick 再繼續 --> 讓瀏覽器有機會 repaint
        await new Promise(r => setTimeout(r, 0));
      }
    },
    async initObserver() {
      if (this.observer) this.observer.disconnect();

      this.observer = new IntersectionObserver(
        async (entries) => {
          entries.forEach(async (entry) => {
            const pageNum = parseInt(entry.target.dataset.pageNum);
            const pageObj = this.pageCanvases.find(p => p.pageNum === pageNum);
            if (!pageObj || !this.pdf) return;

            // 頁面進入視窗（且還沒渲染過）   
            if (entry.isIntersecting) { 
              await this.safeRenderPage(pageNum, entry.target);
              
              // 釋放資源
              this.pageCanvases.forEach((p) => {
                if (Math.abs(p.pageNum - pageNum) > (this.preloadCount + 1)) {
                  this.releaseCanvasElement(p);
                }
              });

              // 預載鄰近頁面
              for (let i = 1; i <= this.preloadCount; i++) {
                const next = this.pageCanvases.find(p => p.pageNum === pageNum + i);
                if (next) await this.safeRenderPage(next.pageNum, next.canvasWrapper);
                const previous = this.pageCanvases.find(p => p.pageNum === pageNum - i);
                if (previous) await this.safeRenderPage(previous.pageNum, previous.canvasWrapper);
              }
             
            }
          });
        },
        { root: this.$refs.pdfContainer, threshold: 0.1 }
      );

      this.pageCanvases.forEach(({ canvasWrapper }) => {
        this.observer.observe(canvasWrapper);
      });
    },
    // 釋放 canvas 佔用資源
    releaseCanvasElement(pageObj) {
      const canvasWrapper = pageObj.canvasWrapper;
      if (!canvasWrapper.dataset.rendered || pageObj.renderTask) return;

      const canvas = canvasWrapper.querySelector('canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
        pageObj.canvasWrapper.removeChild(canvas);
      }

      pageObj.canvasWrapper.dataset.rendered = false;
    },


    // 進行頁面渲染 v2 (with text Layer)
    async safeRenderPage(pageNum, canvasWrapper) {

      const dpr = window.devicePixelRatio || 1;
      const qualityFactor = 1.75;

      const pageObj = this.pageCanvases.find(p => p.pageNum === pageNum);
      if (!pageObj || !this.pdf || canvasWrapper.dataset.rendered === 'true') return;

      let page = this.pageCache.get(pageNum);

      if (!page) {
        page = await this.pdf.getPage(pageNum);
        this.pageCache.set(pageNum, page);

        if (this.pageCache.size > 20) {
          const oldest = this.pageCache.keys().next().value;
          const oldPage = this.pageCache.get(oldest);

          if (!pageObj.renderTask && oldPage?.cleanup) {
            await oldPage.cleanup();
          }

          this.pageCache.delete(oldest);
        }
      }

      canvasWrapper.style.position = 'relative';

      const canvas = document.createElement('canvas');
      canvas.style.display = 'block';
      canvas.style.marginTop = '5px';
      canvas.style.marginBottom = '5px';
      canvas.dataset.pageNum = pageNum;

      const containerWidth = this.$refs.pdfContainer.clientWidth;
      const viewport = page.getViewport({ scale: 1 });

      const renderViewport = page.getViewport({
        scale: (containerWidth / viewport.width) * qualityFactor
      });

      const textViewport = page.getViewport({
        scale: containerWidth / viewport.width
      });

      canvas.width = renderViewport.width * dpr;
      canvas.height = renderViewport.height * dpr;

      canvas.style.width = `${textViewport.width}px`;
      canvas.style.height = `${textViewport.height}px`;

      canvas.style.border = '0.5px solid rgba(0,0,0,.15)';
      canvas.style.boxSizing = 'border-box';

      let textLayer = null;

      if (this.contextLayer) {
        textLayer = document.createElement('div');
        textLayer.className = 'textLayer';
        textLayer.style.width = `${textViewport.width}px`;
        textLayer.style.height = `${textViewport.height}px`;
        textLayer.style.position = 'absolute';
        textLayer.style.top = '0';
        textLayer.style.left = '0';
      }

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;

      pageObj.renderTask = page.render({
        canvasContext: ctx,
        viewport: renderViewport
      });

      try {

        await pageObj.renderTask.promise;

        if (this.contextLayer && textLayer) {
          const textContent = await page.getTextContent();

          await pdfjsLib.renderTextLayer({
            textContent,
            container: textLayer,
            viewport: textViewport
          });
        }

        canvasWrapper.innerHTML = '';

        canvasWrapper.appendChild(canvas);

        if (this.contextLayer && textLayer) {
          canvasWrapper.appendChild(textLayer);
        }

        canvasWrapper.dataset.rendered = true;
        pageObj.canvasWrapper = canvasWrapper;

      }
      catch (e) {
        console.log(e);
      }
      finally {
        pageObj.renderTask = null;
      }

    },

    async handleResize() {

      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(async () => {
        const container = this.$refs.pdfContainer;
        if (!this.pdf || !container) return;

        for (const p of this.pageCanvases) {
          if (p.canvasWrapper.dataset.rendered === 'true') {
            this.releaseCanvasElement(p);
            await this.safeRenderPage(p.pageNum, p.canvasWrapper);
          }
        }
      }, 500);
    }
  },
  watch: {
    async pdfUrl(newUrl) {
      this.cleanAll();
      this.loadProgress = 0;
      this.pageCache = new Map();
      this.pdfUrl = newUrl;
      await this.loadPdf();
    }
  }
};
</script>

<style scoped>
@import 'pdfjs-dist/legacy/web/pdf_viewer.css';

  .pdf-wrapper{
    width: 100%;
    position: relative;
  }
  .pdf-container{
    width: 100%;
    height: 100vh;
    overflow: auto;
    z-index: 2;
    box-sizing: border-box;
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
    transition: 0.5s opacity ease;
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
  @media screen and (max-width: 440px) {
    .pdf-container{
      padding-top: 62px;
      padding-bottom: 110px;
    }
  }
</style>
