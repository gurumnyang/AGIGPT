// src/interface/chatRoute.js
const express = require('express');
const router = express.Router();

const masteragent = require('./masterAgent');

// 채팅 페이지 (프론트엔드)
router.get('/', (req, res) => {
  // 예: ejs 템플릿 렌더링 or SPA 빌드 파일 서빙
  res.render('chat'); // chat.ejs
});

// Deprecated: 사용자 입력 핸들링 API

// router.post('/send', async (req, res) => {
//   const { message } = req.body;
//   const response = await masteragent.handleUserCommand(message);
//   res.json({ reply: response });
// });

module.exports = router;
