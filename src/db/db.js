const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function connectDB() {
  if (process.env.NODE_ENV === 'test') {
    // 테스트 환경에서는 인메모리 서버 사용
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log('인메모리 MongoDB 서버 시작:', uri);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } else {
    // 개발/프로덕션 환경에서는 실제 MongoDB 서버 사용
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/agigpt';
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB 연결 성공');
    } catch (error) {
      console.error('MongoDB 연결 실패:', error);
      process.exit(1);
    }
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    console.log('인메모리 MongoDB 서버 종료');
  }
}

module.exports = { connectDB, disconnectDB };
