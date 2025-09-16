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
      pageCanvases: []
    };
  },
  mounted() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    this.loadPdf(this.pdfUrl);
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    async loadPdf(url) {
      const container = this.$refs.pdfContainer;
      container.innerHTML = ''; // 清空容器
      this.pageCanvases = [];

      try {
        this.pdf = await pdfjsLib.getDocument(url).promise;

        for (let pageNum = 1; pageNum <= this.pdf.numPages; pageNum++) {
          const page = await this.pdf.getPage(pageNum);

          const canvas = document.createElement('canvas');
          canvas.style.display = 'block';
          canvas.style.marginBottom = '10px';
          container.appendChild(canvas);

          this.pageCanvases.push({ page, canvas });
        }

        this.renderPages();
      } 
      catch (err) {
        
      }
    },
    renderPages() {
      if (!this.pdf) return;
      const container = this.$refs.pdfContainer;
      const containerWidth = container.clientWidth;
      const dpr = window.devicePixelRatio || 1; // 支援高解析度

      this.pageCanvases.forEach(({ page, canvas }) => {
        const viewport = page.getViewport({ scale: 1 });

        // 計算 scale：容器寬度 + devicePixelRatio
        const scale = (containerWidth / viewport.width) * dpr;
        const scaledViewport = page.getViewport({ scale });

        // 設置 canvas 真實尺寸
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // CSS 顯示尺寸不超出容器
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${(scaledViewport.height / scaledViewport.width) * containerWidth}px`;

        const context = canvas.getContext('2d');
        page.render({ canvasContext: context, viewport: scaledViewport });
      });
    },
    handleResize() {
      const container = this.$refs.pdfContainer;
      if (!container) return; // 防止 undefined
      this.renderPages(); // 容器大小變化時重新渲染
    }
  },
  watch: {
    pdfUrl(newUrl) {
      this.loadPdf(newUrl); // PDF URL 改變時重新加載
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
