// src/interface/resultModel.js
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  logs: [String],         // 작업 흐름 기록
  finalOutput: String,    // 최종 결과물
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Result', resultSchema);
