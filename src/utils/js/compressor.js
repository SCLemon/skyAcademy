import imageCompression from 'browser-image-compression';

async function compressImage(file, maxWidthOrHeight = 1440, maxSizeKB = 200, quality = 0.9) {

  if (file.size / 1024 <= maxSizeKB && file.type === 'image/webp') {
    return file;
  }

  const options = {
    maxSizeMB: maxSizeKB / 1024,
    maxWidthOrHeight: maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: quality,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    
    // 處理副檔名：移除舊副檔名，統一加上 .webp
    const newFileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    
    return new File([compressedBlob], `${newFileName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("圖片壓縮出錯，回傳原始檔案:", error);
    return file; 
  }
}

export { 
  compressImage 
};