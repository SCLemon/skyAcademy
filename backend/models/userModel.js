const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    idx:{
        type: String,
        required:true,
        unique: true,
        trim: true,
    },
    token: {
        type: String,
        required:true,
        unique: true,
        trim: true,
    },
    account:{
        type:String,
        required:true,
        unique: true,
        trim: true,
    },
    password:{
        type:String,
        required:true,
        trim: true,
    },
    type:{
        type:String,
        required:true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    courseList: { 
        type: [{ 
            course_id: String,
            status: Boolean
        }],
        default: []
    },
    createTime:String,
    lastOnline:{
        type:String,
        default:''
    },
    loginIP:{
        type:String,
        default:''
    },
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
