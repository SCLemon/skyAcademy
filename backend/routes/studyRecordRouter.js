const express = require('express');
const router = express.Router();

const studyRecordModel = require('../models/studyRecordModel');
const userModel = require('../models/userModel')
const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');
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

// 獲取紀錄資料
router.get('/api/studyRecord/getRecord',authMiddleware, async (req, res) => {
    try {
        const record = await studyRecordModel.findOne({ group: req.user.group});
        let send = record? record.detail.reverse(): [];
        return res.send({
            type: 'success',
            record: send,
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

router.get('/api/studyRecord/getStatistics',authMiddleware, async (req, res) => {
    try {
        const record = await studyRecordModel.findOne({ group: req.user.group});
        let send = record? record.detail: [];
        return res.send({
            type: 'success',
            record: send,
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


// 新增計畫
router.post('/api/studyRecord/create',authMiddleware, async (req, res) => {
    const uuid = uuidv4();
    if(req.user.type == 'teacher'){

        
        if(req.body.date.trim() =='' || req.body.content.trim() ==''){
            return res.send({ type: 'error',message: '資料不可為空。'});
        }

        // 檢查日期格式以及自動轉換
        let date;
        try{
            date = format(req.body.date, 'yyyy-MM-dd')
        }
        catch{
            return res.send({ type: 'error', message: '資料格式錯誤。'});
        }

        try {

            let record = await studyRecordModel.findOneAndUpdate({ group: req.user.group});
            if (!record) {
                record = new studyRecordModel({
                    group: req.user.group,
                    detail: [],
                });
            }
            record.detail.push({
                idx:uuid,
                date: date,
                content: req.body.content
            })
            await record.save();

            return res.send({
                type: 'success',
                message: '計畫新增成功。',
            });
        } catch (e) {
            console.log(e);
            return res.send({
                type: 'error',
                message: '伺服器錯誤，請洽客服人員協助。',
            });
        }
    }
    else{
        res.send({
            type:'error',
            message:'您沒有權限創建計畫。'
        })
    }
});

// 刪除計畫
router.delete('/api/studyRecord/delete/:idx',authMiddleware, async (req, res) => {
    if(req.user.type == 'teacher'){

        try {

            const record = await studyRecordModel.findOneAndUpdate(
                { group: req.user.group },
                { $pull: { detail: { idx: req.params.idx } } },
                { new: true }
            );
            
            if (!record) {
                return res.send({ type: 'error', message: '計畫刪除失敗。'});
            }

            return res.send({ type: 'success', message: '計畫新增成功。'});
        } catch (e) {
            console.log(e);
            return res.send({
                type: 'error',
                message: '伺服器錯誤，請洽客服人員協助。',
            });
        }
    }
    else{
        res.send({
            type:'error',
            message:'您沒有權限刪除計畫。'
        })
    }
});

// 修改計畫
router.put('/api/studyRecord/update/:idx',authMiddleware, async (req, res) => {
    if(req.user.type == 'teacher'){

        try {

            const record = await studyRecordModel.findOneAndUpdate(
                { group: req.user.group },
                {
                    $set: {
                        'detail.$[elem].date': req.body.date,
                        'detail.$[elem].content': req.body.content,
                    }
                },
                {
                    arrayFilters: [{ 'elem.idx': req.params.idx }], // 選擇特定元素
                    new: true
                }
            );
            
            if (!record) {
                return res.send({ type: 'error', message: '計畫變更失敗。'});
            }

            return res.send({ type: 'success', message: '計畫變更成功。'});
        } catch (e) {
            console.log(e);
            return res.send({
                type: 'error',
                message: '伺服器錯誤，請洽客服人員協助。',
            });
        }
    }
    else{
        res.send({
            type:'error',
            message:'您沒有權限變更計畫。'
        })
    }
});
module.exports = router;