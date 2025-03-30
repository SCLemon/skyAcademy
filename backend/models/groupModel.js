const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    group:{
        type: String,
        required:true,
        trim: true,
        unique: true,
    },
    limit:{
        type:{
            memory:Number, // 單位 MB
        },
        default:{
            memory: 1024,
        }
    },
    databaseUrl:{ // 資料儲存位置
        type: String,
        required:true,
        trim: true,
        unique: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
});

const groupModel = mongoose.model('Group', groupSchema);

module.exports = groupModel;
