const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    idx:{
        type: String,
        required:true,
        unique: true,
        trim: true,
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
    createTime:String,
});

const courseModel = mongoose.model('Course', courseSchema);

module.exports = courseModel;
