const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please add the product name'],
    maxlength: 32
  },

  description: {
    type: String,
    trim: true,
    required: [true, 'Please add the product description'],
    maxlength: 2000
  },

  price: {
    type: Number,
    trim: true,
    required: [true, 'The product must have a price'],
    maxlength: 32
  },

  user: {
    type: ObjectId,
    ref: 'User'
  },

  countStock: {
    type: Number,
  },

}, { timestamps: true })

module.exports = mongoose.model("Product", productSchema);
