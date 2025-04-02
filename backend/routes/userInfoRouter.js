// 使用者相關資料維護 -- 個人資料表、頭像
const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const groupModel = require('../models/groupModel')
const fs = require('fs');
const {format} = require('date-fns')
const { v4: uuidv4 } = require('uuid');
const multer = require('multer')
const path = require('path')


// 檢查身份
const authMiddleware = async (req, res, next) => {
    const token = req.headers['x-user-token']
    if (!token) {
        return res.send({
            type: 'error',
            message: '未找到授權，請重新登入。',
        });
    }
    const user = await userModel.findOne({ token, status:true });
    if (!user) {
        return res.send({
            type: 'error',
            message: '未找到授權，請重新登入。',
        });
    }
    req.user = user;
    next();
};

// 檢查是否超過空間用量
function getFolderSize(folderPath) {
    let totalSize = 0;
    const files = fs.readdirSync(folderPath);
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) totalSize += getFolderSize(filePath);
      else totalSize += stat.size;
    });
  
    return totalSize;
}
const checkUsageMemory = async(req,res,next)=>{
    try{
        const group = await groupModel.findOne({group: req.user.group})
        if (!group) {
            return res.send({
                type: 'error',
                message: '課程群組不存在。',
            });
        }
        const limitMemory = group.limit.memory;
        const databaseUrl = group.databaseUrl;
        const size = getFolderSize(databaseUrl) / (1024*1024);

        if (size >= limitMemory) {
            return res.send({
                type: 'error',
                message: `空間用量已超過限制 ${limitMemory} MB，如需調額請洽客服人員。`,
            });
        }
        next()
    }
    catch(e){
        console.error(e);
        return res.send({
            type: 'error',
            message: '伺服器錯誤，請洽客服人員協助。',
        });
    }
}

// 更改頭貼 --> 由用戶自行修改，以 token 進行驗證
const upload = multer();
router.post('/api/userInfo/updateIcon', upload.fields([{ name: 'attachments', minCount:1, maxCount: 1}]), authMiddleware, checkUsageMemory, async (req, res) => {
    const token = req.headers['x-user-token']
    try {
        const groupInfo = await groupModel.findOne({group: req.user.group});
        if(!groupInfo){
            return res.send({
                type:'error',
                message:'頭貼上傳失敗（群組不存在）。'
            });
        }
        const databaseUrl = groupInfo.databaseUrl;
        try{

            let attachments = req.files['attachments'][0];
            
            if (!attachments) {
                return res.send({
                    type:'error',
                    message:'上傳頭像不可為空。'
                });
            }

            // 檢查資料夾是否存在
            const folderPath = `${databaseUrl}/userIcon/${req.user.idx}`;
            if (!fs.existsSync(folderPath)){
                fs.mkdirSync(folderPath, { recursive: true });
            }
            else { // 將資料夾清空並重建
                fs.rmSync(folderPath, { recursive: true });
                fs.mkdirSync(folderPath, { recursive: true });
            }

            const realPath = path.join(folderPath, attachments.originalname);
            fs.writeFileSync(realPath, attachments.buffer);


            const user = await userModel.findOneAndUpdate(
                { token: token },  // 查找條件
                { 
                    $set: { 
                        "userImgUrl.url": `/api/userInfo/getUserIcon/${req.user.idx}`, 
                        "userImgUrl.original": realPath 
                    } 
                },
                { new: true }  // 返回更新後的資料
            );
                        
            return res.send({
                type:'success',
                message:'頭像上傳成功。'
            });

        }
        catch(e){
            console.log(e)
            return res.send({
                type:'error',
                message:'課程創建失敗。'
            });
        }
    } catch (e) {
        console.log(e);
        return res.send({
            type: 'error',
            message: '伺服器錯誤，請洽客服人員協助。',
        });
    }
});

// 返回圖片
router.get('/api/userInfo/getUserIcon/:idx',async (req, res) => {

    const user = await userModel.findOne({idx: req.params.idx})
    
    const filePath = user.userImgUrl.original;

    if (fs.existsSync(filePath)) {
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).send('File not found');
    }
});

module.exports = router;