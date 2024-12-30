const OpenAI = require("openai");
require('dotenv').config({
    path: '../.env'
});

// OpenAI API 초기화
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // 환경 변수에서 API 키 가져오기
});

const { ask, Chatter: Conversation } = require('./utils');

//


async function main(){
    const conversation = new Conversation(openai);

    console.log("OpenAI와 대화 시작");
}