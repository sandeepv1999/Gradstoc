const mongoose = require('mongoose')
const { Schema } = mongoose;

const productViewSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
         ref: 'user'
    },
    product_id: {
        type: Schema.Types.ObjectId,
         ref: 'product'
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

const productView = mongoose.model('product_view', productViewSchema);
module.exports = productView;