// 針對 Learn 課程列表
const express = require('express');
const router = express.Router();
const multer = require('multer');
const userModel = require('../models/userModel');
const courseModel = require('../models/courseModel');
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
        idx: user.idx,
        type: user.type,
        group: user.group
    } 
    next();
};


// 獲取課程資料
router.get('/api/learn/getCourse',authMiddleware, async (req, res) => {

    try {

        let courses = [];

        if(req.user.type == 'teacher') courses = await courseModel.find({ group: req.user.group, status:true });
        else if(req.user.type == 'student') courses = await courseModel.find({ group: req.user.group,  studentList: req.user.idx , status:true});
        
        if(courses.length == 0) {
            return res.send({
                type: 'success',
                courses:[],
                message: '資料查詢成功。',
            });
        }
        
        courses = courses.map(obj=>{
            return {
                idx:obj.idx,
                createTime:obj.createTime,
                courseId:obj.courseId,
                courseName:obj.courseName,
                lecturer:obj.lecturer,
                status:obj.status,
            }
        })

        return res.send({
            type: 'success',
            courses:courses,
            message: '資料查詢成功。',
        });

    } catch (e) {
        console.log(e);
        return res.send({
            type: 'error',
            message: '伺服器錯誤，請洽客服人員協助。',
        });
    }
});


module.exports = router;