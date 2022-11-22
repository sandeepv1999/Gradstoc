const mongoose = require('mongoose')
const { Schema } = mongoose;

const bookSchema = new Schema({

    title: {
        type: String,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    main_file: {
        type: String
    },
    image: {
        type: String,
    },
    sample_file: {
        type: String,
    },
    price: {
        type: String,
    },
    tag: {
        type: Array, "default": []
    },
    scl_id: {
        type: Schema.Types.ObjectId,
        ref: 'school'
    },
    sub_id: {
        type: Schema.Types.ObjectId,
        ref: 'subject'
    },
    course_id: {
        type: Schema.Types.ObjectId,
        ref: 'course'
    },
    short_description: {
        type: String
    },
    full_description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
});
const book = mongoose.model('book', bookSchema);

module.exports = book