// src/interface/todoModel.js
const mongoose = require('mongoose');


const todoSchema = new mongoose.Schema({
  description: { type: String, required: true },
  done: { type: Boolean, default: false },
});

module.exports = mongoose.model('Todo', todoSchema);
