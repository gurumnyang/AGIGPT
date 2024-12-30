const openAI = require("openai");
require('dotenv').config({
  path: '../.env'
});

// OpenAI 구성 설정
const openai = new openAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @typedef {Object} Message
 * @property {string} role - 메시지의 역할 (예: "system", "user", "assistant")
 * @property {string} content - 메시지 내용
 */

/**
 * GPT에게 질문을 보내고 응답을 받는 함수
 * @param {Message[]|Message} message - GPT에게 보낼 메시지 배열 또는 프롬프트
 * @param {Message} [prompt] - GPT에게 보낼 프롬프트 (선택적)
 * @returns {string|null} - GPT의 응답 또는 null
 */
async function askGPT(message, prompt) {
  let messages = [];
  
  if (Array.isArray(message)) {
    messages = message;
  } else {
    prompt = message;
  }

  try {
    if(prompt) {
      messages.push(prompt);
    }

    const response = await openai.chat.completions.create({
      model: process.env.model || "gpt-4o-mini", // 사용할 모델
      messages: messages,
      temperature: 0.7,
      top_p: 0.7,
      max_tokens: 1000,
    });

    // 응답에서 메시지 내용 추출
    const content = response.choices[0]?.message?.content || "";
    return content;
  } catch (error) {
    if (error.response) {
      console.error('OpenAI API 에러:', error.response.status, error.response.data);
    } else {
      console.error('OpenAI 요청 에러:', error.message);
    }
    return null;
  }
}

module.exports = { askGPT };
