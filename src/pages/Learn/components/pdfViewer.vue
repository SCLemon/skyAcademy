<template>
  <div ref="pdfContainer" class="pdf-container"></div>
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
    }
  },
  data() {
    return {
      pdf: null,
      pageCanvases: [],
      observer: null,
      preloadCount: 1 // 預載頁數
    };
  },
  mounted() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    this.loadPdf(this.pdfUrl);
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.observer) this.observer.disconnect();
  },
  methods: {
    async loadPdf(url) {
      const container = this.$refs.pdfContainer;
      container.innerHTML = '';
      this.pageCanvases = [];

      try {
        this.pdf = await pdfjsLib.getDocument(url).promise;

        for (let pageNum = 1; pageNum <= this.pdf.numPages; pageNum++) {
          const canvas = document.createElement('canvas');
          canvas.style.display = 'block';
          canvas.style.marginBottom = '10px';
          canvas.dataset.pageNum = pageNum;
          container.appendChild(canvas);

          this.pageCanvases.push({ pageNum, canvas, renderTask: null });
        }

        this.initObserver();
      } catch (err) {
        console.error(err);
      }
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
      const viewport = page.getViewport({ scale: 1 });
      const scale = (containerWidth / viewport.width) * dpr;
      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${(scaledViewport.height / scaledViewport.width) * containerWidth}px`;

      const ctx = canvas.getContext('2d');

      // 建立 renderTask 並保存
      pageObj.renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport });

      try {
        await pageObj.renderTask.promise;
        canvas.dataset.rendered = true;
      } catch (e) {
        if (e?.name === 'RenderingCancelledException') {
          // render 被取消，不是錯誤
        } else {
          console.error('Render error:', e);
        }
      } finally {
        pageObj.renderTask = null; // render 完成後清除
      }
    },
    handleResize() {
      if (!this.pdf) return;

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
.pdf-container {
  width: 100%;
  height: 100vh;
  overflow: auto;
}
</style>
