<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import jsCookie from 'js-cookie'
import axios from 'axios'
export default {
  name: 'App',
  async mounted(){
    this.$bus.$on('handleAlert',this.handleAlert)
    this.$bus.$on('copyToClipboard',this.copyToClipboard)
    await this.setAnonymousMode();
    await this.generateFingerprint();
  },
  computed:{
  },
  methods:{
    handleAlert(title,message,type){
      // success, warning, info, error
      this.$notify({title,message,type});
    },
    copyToClipboard(title, text) {
      if (!text) return;
      navigator.clipboard.writeText(text)
      .then(() => {
        this.$bus.$emit('handleAlert',title,'已複製到剪貼簿','success');
      })
      .catch(() => {});
    },
    async setAnonymousMode(){
      const authToken = jsCookie.get('authToken');
      if(!authToken){
        let data;
        try{
          const res = await axios.post('/login/anonymous',null,
          {
            headers:{
              'x-user-fingerprint':localStorage.getItem('deviceFingerprint')
            }
          })
          data = res.data;
          if(data.type == 'success'){
            this.$bus.$currentUser = res.data.userInfo
            this.$bus.$emit('setUserInfo')
          }
        }
        catch(e){}
      }
    },
    async generateFingerprint() {
        // 如果已經存在 localStorage，直接返回
        const storedFP = localStorage.getItem('deviceFingerprint');
        if (storedFP) return storedFP;

        const components = [];

        // 瀏覽器 / 裝置資訊
        components.push(navigator.userAgent);
        components.push(navigator.language);
        components.push(navigator.platform);
        components.push(screen.width + 'x' + screen.height);
        components.push(screen.colorDepth);

        // Plugins / MimeTypes
        const plugins = Array.from(navigator.plugins || []).map(p => p.name).join(',');
        components.push(plugins);

        const mimeTypes = Array.from(navigator.mimeTypes || []).map(m => m.type).join(',');
        components.push(mimeTypes);

        // 時區
        components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

        // Canvas Fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '16px Arial';
        ctx.fillText('Fingerprint test', 2, 2);
        const canvasHash = ctx.getImageData(0, 0, canvas.width, canvas.height).data.join(',');
        components.push(canvasHash);

        // Combine all components
        const rawString = components.join('||');

        let hashHex;

        try {
            // 嘗試使用 crypto.subtle
            if (window.crypto && crypto.subtle) {
                const buffer = new TextEncoder().encode(rawString);
                const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } else {
                // fallback 使用 js-sha256
                hashHex = sha256(rawString);
            }
        } catch (e) {
            console.warn('Fingerprint SHA-256 error, fallback to js-sha256', e);
            hashHex = sha256(rawString);
        }

        // 存到 localStorage
        localStorage.setItem('deviceFingerprint', hashHex);

        return hashHex;
    }
  }
}
</script>

<style>
  ::-webkit-scrollbar{
    display: none;
  }
  #app {
    overflow: hidden;
  }
  img, canvas {
    -webkit-user-drag: none;
    user-select: none;
    pointer-events: none; /* 如果需要完全不能操作 */
  }
</style>

