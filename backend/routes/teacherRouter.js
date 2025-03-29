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
        type: user.type,
        group: user.group
    } 
    next();
};

// 創建新用戶
router.post('/api/createStudent',authMiddleware, async (req, res) => {
    const {account, password, name, type} = req.body;
    
    try {

        if (req.user.type === 'teacher') {
            
            const newUser = new userModel({
                idx: uuidv4(),
                token:uuidv4(),
                account: account,
                password: password,
                name: name,
                group: req.user.group,
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
                console.log(e)
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
            const user = await userModel.findOne({ idx: idx, group:req.user.group });

            if (!user) {
                return res.send({
                    type: 'error',
                    message: '用戶權限變更失敗！',
                });
            }

            const updatedUser = await userModel.findOneAndUpdate({ idx: idx , group:req.user.group},{ $set: { status: !user.status } },{ new: true });

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

            let students = await userModel.find({ type: 'student', group: req.user.group });

            students = students.map(obj=>{
                return {
                    idx:obj.idx,
                    createTime:obj.createTime,
                    account:obj.account,
                    lastOnline:obj.lastOnline,
                    loginIP:obj.loginIP,
                    name:obj.name,
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

// 以下為課程區域操作

// 創建課程
router.post('/api/createCourse',authMiddleware, async (req, res) => {
    const {courseId,courseName,lecturer} = req.body;
    try {
        if (req.user.type === 'teacher') {
            const idx = uuidv4();
            const newCourse = new courseModel({
                idx:idx,
                courseId,
                courseName,
                lecturer,
                group: req.user.group,
                createTime: format(new Date(),'yyyy-MM-dd HH:mm:ss'),
            });
        
            try{
                await newCourse.save()

                // 創建課程專屬資料夾
                const folderPath = path.resolve(__dirname, `../../database/${req.user.group}/${idx}`);
                if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

                return res.send({
                    type:'success',
                    message:'課程創建成功。'
                });
            }
            catch(e){
                console.log(e)
                return res.send({
                    type:'error',
                    message:'課程創建失敗。'
                });
            }
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限創建課程資料。',
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

// 獲取課程資料
router.get('/api/getCourse',authMiddleware, async (req, res) => {

    try {

        if (req.user.type === 'teacher') {

            let courses = await courseModel.find({ group: req.user.group });

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
                    studentList:obj.studentList
                }
            })

            return res.send({
                type: 'success',
                courses:courses,
                message: '資料查詢成功。',
            });
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限查看課程資料。',
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

// 刪除課程
router.delete('/api/deleteCourse/:idx',authMiddleware,async(req,res)=>{

    try {
        if (req.user.type === 'teacher') {

            const idx = req.params.idx;
            
            if (!idx || typeof idx !== 'string' || idx.length !== 36) {
                return res.send({
                    type: 'error',
                    message: '課程刪除失敗！'
                });
            }

            const deletedCourse = await courseModel.findOneAndDelete({ idx: idx, group:req.user.group });

            if (!deletedCourse) {
                return res.send({
                    type: 'error',
                    message: '課程刪除失敗！',
                });
            }
            
            // 刪除課程專屬資料夾
            const folderPath = path.resolve(__dirname, `../../database/${req.user.group}/${idx}`);
            if (fs.existsSync(folderPath)) fs.rmSync(folderPath, { recursive: true, force: true });

            return res.send({
                type: 'success',
                message: `課程 ${deletedCourse.courseId} 已成功刪除。`,
            });
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限刪除課程資料。',
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

// 隱藏課程
router.put('/api/stopCourse/:idx',authMiddleware,async(req,res)=>{
    try {
        if (req.user.type === 'teacher') {

            const idx = req.params.idx;
            
            if (!idx || typeof idx !== 'string' || idx.length !== 36) {
                return res.send({
                    type: 'error',
                    message: '用戶權限變更失敗！'
                });
            }
            const course = await courseModel.findOne({ idx: idx, group:req.user.group });

            if (!course) {
                return res.send({
                    type: 'error',
                    message: '課程權限變更失敗！',
                });
            }

            const updatedCourse = await courseModel.findOneAndUpdate({ idx: idx, group:req.user.group },{ $set: { status: !course.status } },{ new: true });

            if (!updatedCourse) {
                return res.send({
                    type: 'error',
                    message: '用戶權限變更失敗！',
                });
            }

            return res.send({
                type: 'success',
                message: `課程 ${updatedCourse.courseId} 權限變更成功。`,
            });
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限修改課程資料。',
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

// 指派課程
router.post('/api/setStudentToCourse',authMiddleware,async(req,res)=>{
    let {idx, courseId, lecturer, studentList} = req.body;

    try {
        if (req.user.type === 'teacher') {
            const setCourse = await courseModel.findOneAndUpdate({idx:idx, group:req.user.group},{
                $set: { 
                    courseId:courseId,
                    lecturer:lecturer,
                    studentList: studentList 
                }
            })

            if (!setCourse) {
                return res.send({
                    type: 'error',
                    message: '課程修改失敗！',
                });
            }

            return res.send({
                type: 'success',
                message: `課程 ${setCourse.courseId} 修改成功。`,
            });
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限修改課程。',
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

// 獲取特定課程的修課名單
router.get('/api/getCourseStudentList/:idx',authMiddleware, async (req, res) => {
    const idx = req.params.idx;
    try {

        if (req.user.type === 'teacher') {

            let target = await courseModel.findOne({ idx:idx, group: req.user.group });

            if (!target) {
                return res.send({
                    type: 'error',
                    message: '修課資料查詢失敗。',
                });
            }

            return res.send({
                type: 'success',
                studentList:target.studentList,
                message: '修課資料查詢成功。',
            });
        } 
        else {
            return res.send({
                type: 'error',
                message: '您沒有權限查看修課名單。',
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


module.exports = router;