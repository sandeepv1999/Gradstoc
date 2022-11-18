const mongoose = require('mongoose')
const { Schema } = mongoose;

const subjectSchema = new Schema({
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
    createdAt: {
        type: Date,
        default: Date.now() 
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
});         

const Subject = mongoose.model('subject', subjectSchema);
module.exports = Subject;