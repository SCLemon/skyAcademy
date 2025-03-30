// admin 以及空間配置操作
const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const fs = require('fs');
const path = require('path');
const {format} = require('date-fns')
const { v4: uuidv4 } = require('uuid');


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
    req.user ={
        type: user.type,
        group: user.group
    } 
    next();
};

// 下方為 admin 操作區
// 額外新增欄位
const update = async () => {
    try {
        const users = await userModel.find();

        for (let user of users) {
            await userModel.updateOne({ _id: user._id, type: 'teacher' }, { $set: { group: '0001' } });
        }

        console.log('所有文件的欄位已更新');
    } catch (error) {
        console.error('更新失敗:', error);
    }
};

// 新增教師
async function createUserByAdmin(){
    const account = 'blc0000421';
    const password = '34864015';
    const type = 'teacher';
    const group = '0001'
    const name = 'SCLemon'
    const newUser = new userModel({
        idx: uuidv4(),
        token:uuidv4(),
        account: account,
        password: password,
        name: name,
        group: group,
        createTime: format(new Date(),'yyyy-MM-dd HH:mm:ss'),
        type:type
    });
    await newUser.save();
    console.log('資料創建完畢')
}


// 獲取使用容量
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

router.get('/api/getUsageMemory',authMiddleware, async (req, res) => {
   
    try {
        if (req.user.type === 'teacher') {
            const token = req.headers['x-user-token']
            const folderPath = path.resolve(__dirname, `../../database/${req.user.group}`);
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
            const size = getFolderSize(folderPath) / (1024*1024);
            return res.send({
                type:'success',
                size:size,
                message:'儲存空間用量資訊獲取成功！'
            })
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限查看儲存空間用量。',
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

module.exports = router;