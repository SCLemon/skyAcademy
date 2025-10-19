<template>
  <div class="pdf-wrapper">
    <div class="pdf-loading" v-if="isLoading"><img src="img/Loading.gif"></div>
    <div ref="pdfContainer" class="pdf-container"></div>
  </div>
</template>

<script>
import jsCookie from 'js-cookie';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

export default {
  name: 'PdfViewer',
  props: {
    pdfUrl: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
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

    this.loadPdf(this.pdfUrl);
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
    async loadPdf(url) {
      this.isLoading = true;
      const container = this.$refs.pdfContainer;
      container.innerHTML = '';
      this.pageCanvases = [];

      try {
        this.pdf = await pdfjsLib.getDocument({
          url:url,
          httpHeaders:{
            'x-user-token':jsCookie.get('authToken')
          }
        }).promise;

        for (let pageNum = 1; pageNum <= this.pdf.numPages; pageNum++) {
          const canvas = document.createElement('canvas');
          canvas.style.display = 'block';
          canvas.style.marginTop = '5px';
          canvas.style.marginBottom = '5px';
          canvas.dataset.pageNum = pageNum;
          container.appendChild(canvas);

          this.pageCanvases.push({ pageNum, canvas, renderTask: null });
          this.isLoading = false;
        }

        this.initObserver();
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
    pdfUrl(newUrl) {
      this.loadPdf(newUrl);
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
  .pdf-container {
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
  }
</style>
