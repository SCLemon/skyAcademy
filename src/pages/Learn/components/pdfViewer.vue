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
    }
  },
  data() {
    return {
      isLoading: true,
      loadProgress:0,
      loadTimer: null,
      pdf: null,
      pageCanvases: [],
      observer: null,
      preloadCount: 1 // 預載頁數
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
    if (this.observer) this.observer.disconnect();
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
      if (this.pdf) this.pdf.destroy(); // 銷毀舊 PDF 解析器與 worker

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

        // 進行結構渲染
        for (let pageNum = 1; pageNum <= this.pdf.numPages; pageNum++) {
          const canvas = document.createElement('canvas');
          canvas.style.display = 'block';
          canvas.style.marginTop = '5px';
          canvas.style.marginBottom = '5px';
          canvas.dataset.pageNum = pageNum;
          container.appendChild(canvas);
          this.pageCanvases.push({ pageNum, canvas, renderTask: null });
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
            if (entry.isIntersecting) {
              const pageNum = parseInt(entry.target.dataset.pageNum);
              this.safeRenderPage(pageNum, entry.target);

              // 預載下一頁
              for (let i = 1; i <= this.preloadCount; i++) {
                const next = this.pageCanvases.find(p => p.pageNum === pageNum + i);
                if (next && !next.canvas.dataset.rendered) {
                  this.safeRenderPage(next.pageNum, next.canvas);
                }
              }
            }
          });
        },
        { root: this.$refs.pdfContainer, threshold: 0.1 }
      );

      this.pageCanvases.forEach(({ canvas }) => {
        this.observer.observe(canvas);
      });
    },
    async safeRenderPage(pageNum, canvas) {
      const pageObj = this.pageCanvases.find(p => p.pageNum === pageNum);
      if (!pageObj || !this.pdf) return;

      // 如果還有舊的 renderTask，在開始新渲染前取消
      if (pageObj.renderTask) {
        pageObj.renderTask.cancel();
      }

      const page = await this.pdf.getPage(pageNum);

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
        if (!canvas.dataset.rendered) return; // 沒渲染過的不用 resize
        this.safeRenderPage(pageNum, canvas); // 重渲染
      });
    }
  },
  watch: {
    async pdfUrl(newUrl) {
      this.loadProgress = 0;
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
