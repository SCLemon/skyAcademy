const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    createTime:String,
    idx:{
        type: String,
        required:true,
        unique: true,
        trim: true,
    },
    bannerFolderPath:{
        type: String,
        trim: true,
        default:''
    },
    courseId:{
        type: String,
        required:true,
        trim: true,
    },
    courseName:{
        type: String,
        default: true,
    },
    lecturer:{
        type: String,
        default: true,
    },
    group:{
        type: String,
        required:true,
        trim: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    meta: { 
        type: [{
            idx:String,
            type:String, // Video or Text
            title:String,
            videoSrc:String,
            abstract:String,
            attachment:[{
                name:String,
                type:String,
                src:String,
            }]
        }],
        default: []
    },
    studentList:{
        type:[String],
        default:[]
    }
});

const courseModel = mongoose.model('Course', courseSchema);

module.exports = courseModel;
