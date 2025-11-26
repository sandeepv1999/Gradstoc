const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema({
  title: {
    type: String,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  main_file: {
    type: String,
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
  tag_id: {
    type: Array,
    ref: "tag",
  },
  scl_id: {
    type: Schema.Types.ObjectId,
    ref: "school",
  },
  sub_id: {
    type: Schema.Types.ObjectId,
    ref: "subject",
  },
  course_id: {
    type: Schema.Types.ObjectId,
    ref: "course",
  },
  type: {
    type: String,
    enum: ["0", "1"],
  },
  short_description: {
    type: String,
  },
  full_description: {
    type: String,
  },
  visiblity: {
    type: String,
    enum: [0, 1],
    default: "1",
  },
  isDeleted: {
    type: String,
    enum: [0, 1],
    default: "0",
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    // default:Date.now
  },
});
const product = mongoose.model("product", ProductSchema);

module.exports = product;
