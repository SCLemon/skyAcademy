const express = require('express');
const router = express.Router();

const multer = require('multer');
const userModel = require('../models/userModel');

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
        type: user.type
    } 
    next();
};

// 創建新用戶
router.post('/api/createStudent',authMiddleware, async (req, res) => {
    const {account, password, type} = req.body;
    try {
        if (req.user.type === 'teacher') {
            const newUser = new userModel({
                idx: uuidv4(),
                token:uuidv4(),
                account: account,
                password: password,
                createTime: format(new Date(),'yyyy-MM-dd HH:mm:ss'),
                type:type
            });
        
            try{
                await newUser.save()
                return res.send({
                    type:'success',
                    message:'用戶創建成功。'
                });
            }
            catch(e){
                return res.send({
                    type:'error',
                    message:'用戶創建失敗。'
                });
            }
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限刪除學生資料。',
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

// 刪除用戶
router.delete('/api/deleteStudent/:idx',authMiddleware,async(req,res)=>{
    try {
        if (req.user.type === 'teacher') {

            const idx = req.params.idx;
            
            if (!idx || typeof idx !== 'string' || idx.length !== 36) {
                return res.send({
                    type: 'error',
                    message: '用戶刪除失敗！'
                });
            }

            const deletedUser = await userModel.findOneAndDelete({ idx: idx });

            if (!deletedUser) {
                return res.send({
                    type: 'error',
                    message: '用戶刪除失敗！',
                });
            }

            return res.send({
                type: 'success',
                message: `學生 ${deletedUser.account} 已成功刪除。`,
            });
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限創建學生資料。',
            });
        }
    } catch (e) {
        console.log(e);
        return res.send({
            type: 'error',
            message: '伺服器錯誤，請洽客服人員協助。',
        });
    }
})

// 凍結用戶
router.put('/api/stopStudent/:idx',authMiddleware,async(req,res)=>{
    try {
        if (req.user.type === 'teacher') {

            const idx = req.params.idx;
            
            if (!idx || typeof idx !== 'string' || idx.length !== 36) {
                return res.send({
                    type: 'error',
                    message: '用戶權限變更失敗！'
                });
            }
            const user = await userModel.findOne({ idx: idx });

            if (!user) {
                return res.send({
                    type: 'error',
                    message: '用戶權限變更失敗！',
                });
            }

            const updatedUser = await userModel.findOneAndUpdate({ idx: idx },{ $set: { status: !user.status } },{ new: true });

            if (!updatedUser) {
                return res.send({
                    type: 'error',
                    message: '用戶權限變更失敗！',
                });
            }

            return res.send({
                type: 'success',
                message: `學生 ${updatedUser.account} 權限變更成功。`,
            });
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限修改學生資料。',
            });
        }
    } catch (e) {
        console.log(e);
        return res.send({
            type: 'error',
            message: '伺服器錯誤，請洽客服人員協助。',
        });
    }
})


// 獲取學生資料
router.get('/api/getStudent',authMiddleware, async (req, res) => {

    try {

        if (req.user.type === 'teacher') {

            let students = await userModel.find({ type: 'student' });

            students = students.map(obj=>{
                return {
                    idx:obj.idx,
                    createTime:obj.createTime,
                    account:obj.account,
                    lastOnline:obj.lastOnline,
                    loginIP:obj.loginIP,
                    status:obj.status
                }
            })

            return res.send({
                type: 'success',
                students:students,
                message: '資料查詢成功。',
            });
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限查看學生資料。',
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


// 額外新增欄位
const updateIdxIncrementally = async () => {
    try {
        const users = await userModel.find();
        let index = uuidv4(); 

        for (let user of users) {
            await userModel.updateOne({ _id: user._id }, { $set: { idx: index } });
            index = uuidv4()
        }

        console.log('所有文件的欄位已更新');
    } catch (error) {
        console.error('更新失敗:', error);
    }
};

// updateIdx();

module.exports = router;