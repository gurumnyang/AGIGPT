require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { connectDB, disconnectDB } = require('./db/db');

const documentRoutes = require('./interface/documentController');
const todoRoutes = require('./interface/todoController'); // 추가
const chatRoutes = require('./interface/chatRoute');

const socket = require('./socket');

const app = express();
const server = http.createServer(app);

app.use(express.json());

// 템플릿 엔진 설정 (EJS 예시)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// DB 연결
connectDB();

// 라우트
app.get('/', (req, res) => {
  //send to chat
  res.redirect('/chat');
});
// app.use('/documents', documentRoutes);
app.use('/chat', chatRoutes);
// app.use('/todos', todoRoutes); // 추가

// Socket.IO 초기화
socket.init(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// 서버 종료 시 DB 연결 해제
process.on('SIGINT', async () => {
  await disconnectDB();
  server.close(() => {
    console.log('서버 종료');
    process.exit(0);
  });
});
