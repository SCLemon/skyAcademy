const express = require('express');
const router = express.Router();

const multer = require('multer');
const userModel = require('../models/userModel');

const {format} = require('date-fns')
const { v4: uuidv4 } = require('uuid');

// 創建新用戶
router.post('/api/createStudent', async (req, res) => {
    const {account, password, type} = req.body;
    const token = req.headers['x-user-token']
    if (!token) {
        return res.send({
            type: 'error',
            message: '未找到授權，請重新登入。',
        });
    }
    try {
        const teacher = await userModel.findOne({ token });
        if (!teacher) {
            return res.send({
                type: 'error',
                message: '未找到授權，請重新登入。',
            });
        }

        if (teacher.type === 'teacher') {

            const newUser = new userModel({
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
});

// 登入驗證
router.post('/login/verify', async (req, res) => {
    const {account, password, type} = req.body;

    if (!account || !password || !type) {
        return res.send({
            type:'error',
            message:'登入資料不可為空。'
        });
    }

    try {
        const user = await userModel.findOne({ account, password, type });
        if (!user) {
            return res.send({
                type:'error',
                message:'帳號或密碼錯誤。'
            });
        }
        if (!user.status){
            return res.send({
                type:'error',
                message:'帳號已被凍結，請洽詢客服人員協助。'
            });
        }

        const loginIP = req.ip;
        const loginTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        user.lastOnline = loginTime;
        user.loginIP = loginIP;
        await user.save();

        res.cookie('authToken',user.token,{
            maxAge:86400 * 1000 * 7, // 7 天
        })
        userData = {
            account:user.account,
            typeEng:user.type,
            type: user.type == 'teacher'?'教師':'學生'
        }
        return res.send({
            type:'success',
            userInfo: userData,
            message:'登入成功！'
        });
        
    } catch (e) {
        console.log(e)
        return res.send({
            type:'error',
            message:'伺服器錯誤，請洽客服人員協助。'
        });
    }
});

// token 驗證
router.post('/login/token', async (req, res) => {
    const token = req.headers['x-user-token']
    try {
        const user = await userModel.findOne({ token });
        if (!user || !user.status) {
            return res.send({type:'error', message:'無效使用者', showAlert:true});
        }
        userData = {
            account:user.account,
            typeEng:user.type,
            type: user.type == 'teacher'?'教師':'學生'
        }

        return res.send({
            type:'success',
            userInfo: userData,
            message:'登入成功！',
            showAlert: false
        });
    } 
    catch (e) {
        return res.send({type:'error', message:'伺服器錯誤' ,showAlert:true});
    }
});

// 獲取學生資料
router.get('/api/getStudent', async (req, res) => {
    const token = req.headers['x-user-token']
    if (!token) {
        return res.send({
            type: 'error',
            message: '未找到授權，請重新登入。',
        });
    }
    try {
        const teacher = await userModel.findOne({ token });
        if (!teacher) {
            return res.send({
                type: 'error',
                message: '未找到授權，請重新登入。',
            });
        }

        if (teacher.type === 'teacher') {

            let students = await userModel.find({ type: 'student' });

            students = students.map(obj=>{
                return {
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

module.exports = router;