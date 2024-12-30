/**
 * test.js
 * 프로젝트 기능을 간단히 테스트하는 스크립트
 */
const { connectDB, disconnectDB } = require('./db/db');
const { askGPT, augmentedPrompt } = require('./utils');
const Document = require('./db/model/documentModel');
require('dotenv').config({
  path: '../.env'
});

async function runTests() {
  // DB 연결
  await connectDB();

  // 테스트용 문서 생성
  const testDoc = await Document.create({
    title: '테스트 문서',
    content: '이 문서는 테스트를 위한 예시 문서입니다.',
    tags: ['테스트', '예시'],
  });
  console.log('테스트 문서 생성:', testDoc);

  // GPT 단순 호출 테스트
  console.log('[Test] GPT 단순 호출 테스트');
  const res1 = await askGPT('안녕, GPT-4!');
  console.log('응답:', res1);

  // RAG 테스트
  console.log('[Test] RAG 테스트');
  const res2 = await augmentedPrompt('테스트'); // '테스트'라는 키워드를 문서 타이틀에서 검색
  console.log('RAG 응답:', res2);

  // 테스트용 문서 삭제
  await Document.findByIdAndDelete(testDoc._id);
  console.log('테스트 문서 삭제');

  // DB 연결 해제
  await disconnectDB();
}

runTests();
