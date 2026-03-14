// 前端圖片壓縮代碼
async function compressImage(file, maxSize = 1440, quality = 0.8) {
  return new Promise((resolve, reject) => {

    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result

      img.onload = () => {

        let width = img.width
        let height = img.height

        const maxEdge = Math.max(width, height)

        // 如果超過 maxSize 才 resize
        if (maxEdge > maxSize) {
          const scale = maxSize / maxEdge
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {

            // 如果壓縮後沒有變小就回傳原圖
            if (!blob || blob.size >= file.size) {
              resolve(file)
              return
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type
            })

            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }

      img.onerror = reject
    }

    reader.onerror = reject
  })
}

export { 
    compressImage 
}