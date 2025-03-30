// 針對 Learn 課程列表
const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const courseModel = require('../models/courseModel');
const fs = require('fs');
const path = require('path');


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

router.get('/api/learn/getCourse', authMiddleware, async (req, res) => {
    try {
        let courses = [];

        if (req.user.type === 'teacher') {
            courses = await courseModel.find({ group: req.user.group, status: true });
        } else if (req.user.type === 'student') {
            courses = await courseModel.find({
                group: req.user.group,
                studentList: req.user.idx,
                status: true,
            });
        }

        if (courses.length === 0) {
            return res.send({
                type: 'success',
                courses: [],
                message: '資料查詢成功。',
            });
        }

        courses = await Promise.all(
            courses.map(async (course) => {
                let bannerImg = [];
                const bannerFolderPath = course.bannerFolderPath;

                if (fs.existsSync(bannerFolderPath)) {
                    bannerImg = fs.readdirSync(bannerFolderPath).map((file) => {
                        return {
                            name: file,
                            url: `/api/learn/getCourseBanner/${course.idx}/${file}`, // 使用相對URL返回圖片
                        };
                    });
                }

                return {
                    idx: course.idx,
                    createTime: course.createTime,
                    courseId: course.courseId,
                    courseName: course.courseName,
                    lecturer: course.lecturer,
                    status: course.status,
                    bannerImg: bannerImg,
                };
            })
        );

        return res.send({
            type: 'success',
            courses: courses,
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

// 返回圖片
router.get('/api/learn/getCourseBanner/:idx/:imageName',async (req, res) => {
    const { idx, imageName } = req.params;
    
    const course = await courseModel.findOne({ idx: idx });
    const bannerFolderPath = course.bannerFolderPath;
    const filePath = path.join(bannerFolderPath, imageName);

    if (fs.existsSync(filePath)) {

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).send('File not found');
    }
});


module.exports = router;