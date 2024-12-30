const OpenAI = require("openai");
require('dotenv').config({
    path: '../.env'
});

// OpenAI API 초기화
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // 환경 변수에서 API 키 가져오기
});

const { ask, Chatter: Conversation } = require('./utils');

// 기존 코드 수정
async function main() {
    const conversation = new Conversation(openai);

    console.log("OpenAI와 대화 시작 ");

    //enable logging
    conversation.logging = true;

    const systemMessage = 'You are helpful assistant. GPT';
    conversation.addSystemMessage(systemMessage);

    const message = '안녕하세요. OpenAI와 대화를 시작합니다.';
    conversation.addBotMessage(message);

    // 응답 받기
    let prompt = await ask("You: ");
    let response = await conversation.getResponse(prompt);
}

main();
