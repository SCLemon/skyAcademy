
import axios from "axios";

const publicVapidKey = 'BDaELLgGYNHLi1choUSCQFtfKmP56DV1f7TJunGM_dqPRgQosEoflD4xEiLYG4DTypK4DWmdZ5H27XthqyYRm0g';

async function registerServiceWorker() {
  
  if ("serviceWorker" in navigator) {
    const existingReg = await navigator.serviceWorker.getRegistration();
    try{
      if(!existingReg) {
        await navigator.serviceWorker.register("/service-worker.js")
        console.log("New SW Registered");
      }
      console.log("SW have Registered");
    }
    catch(e){
      console.log("SW Register Failed");
    }
  }
}

async function subscribe() {
  const reg = await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    console.log("Already Subscribed");
    return;
  }

  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  });

  // 傳給後端儲存
  try{
      const res = await axios.post("/api/ws/save-subscribe", {
        subscription: sub
      });
      console.log("Subscribed:", res.data.type);
  }
  catch(e){}

}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export {
  registerServiceWorker, subscribe
}