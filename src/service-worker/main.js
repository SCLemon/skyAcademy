
import axios from "axios";

const publicVapidKey = 'BDaELLgGYNHLi1choUSCQFtfKmP56DV1f7TJunGM_dqPRgQosEoflD4xEiLYG4DTypK4DWmdZ5H27XthqyYRm0g';

// 產生裝置指紋
async function generateFingerprint() {

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
    const buffer = new TextEncoder().encode(rawString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } 
  catch (e) {
    console.warn('Fingerprint SHA-256 error, fallback to js-sha256', e);
    hashHex = sha256(rawString);
  }

  // 存到 localStorage
  localStorage.setItem('deviceFingerprint', hashHex);

  return hashHex;
}

// 註冊 ServiceWorker
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const existingReg = await navigator.serviceWorker.getRegistration();
    try{
      if(!existingReg) {
        await navigator.serviceWorker.register("/service-worker.js")
        return { type:'success', message: 'Service Worker 註冊成功'};
      }
      else {
        await existingReg.update();
        return { type:'success', message: 'Service Worker 更新成功'};
      }
    }
    catch(e){
      console.log(e)
      return { type:'error',message: 'Service Worker 註冊失敗'};
    }
  }
  else {
    return { type:'error',message: '本裝置不支援 Service Worker 訂閱服務'};
  }
}

// 進行裝置訂閱
async function subscribe() {

  const registerResult = await registerServiceWorker();
  if(registerResult.type == 'error') return registerResult;

  const reg = await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  if (existing) await existing.unsubscribe();

  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted"){
      return { type:'error',message: '請開啟通知權限'};
    }
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  });

  // 傳給後端儲存
  try{
      const res = await axios.post("/api/ws/save-subscribe", {
        subscription: sub
      },
      {
        headers:{
          'x-user-fingerprint': await generateFingerprint()
        }
      });
      return { type: res.data.type, message: res.data.message };
  }
  catch(e){
    return { type:'error',message: '推播訂閱失敗'};
  }

}

// 裝置訂閱狀態
async function checkSubscribed(){
  try{
    const res = await axios.get("/api/ws/check-subscribe",
    {
      headers:{
        'x-user-fingerprint': await generateFingerprint()
      }
    });
    return res.data.subscribed;
  }
  catch(e){
    return false;
  }
}


function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export {
   generateFingerprint, registerServiceWorker, subscribe, checkSubscribed
}