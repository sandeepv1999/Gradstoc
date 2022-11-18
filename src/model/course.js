const mongoose = require('mongoose')
const { Schema } = mongoose;

const courseSchema = new Schema({
    name: {
        type: String,
    },  
    description: {
        type: String,
    },
    user_id: {
        type: Schema.Types.ObjectId,
         ref: 'user'
    },
    school_id: {
        type: Schema.Types.ObjectId,
         ref: 'school'
    },
    subject_id: {
        type: Schema.Types.ObjectId,
         ref: 'subject'
    },
    createdAt: {
        type: Date,
        default: Date.now() 
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
});         

const Course = mongoose.model('course', courseSchema);
module.exports = Course;