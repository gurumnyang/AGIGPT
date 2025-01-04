
const openAI = require("openai");
require('dotenv').config({
  path: '../.env'
});

// OpenAI 구성 설정
const openai = new openAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 5
});

/**
 * @typedef {Object} Message
 * @property {string} role - 메시지의 역할 (예: "system", "user", "assistant")
 * @property {string} content - 메시지 내용
 */
/**
 * @typedef {Object} Option
 * @property {number} [temperature] - 샘플링 온도 (0에서 1 사이의 값)
 * @property {number} [top_p] - 상위 확률 질량 (0에서 1 사이의 값)
 * @property {number} [max_tokens] - 생성할 최대 토큰 수
 * @property {string} [MODEL] - 사용할 모델 이름
 * @property {object} [tools] - 사용할 도구 목록
 */

/**
 * GPT에게 질문을 보내고 원문 응답을 받는 함수
 * @param {Message[]|Message} message - GPT에게 보낼 메시지 배열 또는 프롬프트
 * @param {Message} [prompt] - GPT에게 보낼 프롬프트 (선택적)
 * @param {Option} [options] - GPT에게 전달할 옵션 (선택적)
 * @returns {object|null} - GPT의 원문 응답 또는 null
 */
async function requestGPT(message, prompt, options) {
  
  let messages = [];

  if(Array.isArray(message)) {
  messages = message;
  } else {
  messages.push(message);
  }

  if(message && prompt && typeof prompt === 'object') {
  options = prompt;
  prompt = null;
  }

  try {
  if(prompt) {
    messages.push(prompt);
  }
  

  const response = await openai.chat.completions.create({
    model: process.env.model || "gpt-4o-mini", // 사용할 모델
    messages: messages,
    temperature: 0.5,
    top_p: 0.5,
    max_tokens: 3000,
    ...options,
  });

  return response;
  } catch (error) {
  if (error.response) {
    console.error('OpenAI API 에러:', error.response.status, error.response.data);
  } else {
    console.error('OpenAI 요청 에러:', error.message);
  }
  return null;
  }
}

/**
 * GPT에게 질문을 보내고 응답을 받는 함수
 * @param {Message[]|Message} message - GPT에게 보낼 메시지 배열 또는 프롬프트
 * @param {Message} [prompt] - GPT에게 보낼 프롬프트 (선택적)
 * @param {Option} [options] - GPT에게 전달할 옵션 (선택적)
 * @returns {string|null} - GPT의 응답 또는 null
 */
async function askGPT(message, prompt, options) {
  const response = await requestGPT(message, prompt, options);
  if (response) {
  // 응답에서 메시지 내용 추출
  const content = response.choices[0]?.message?.content || "";
  return content;
  }
  return null;
}


module.exports = { askGPT, requestGPT };
