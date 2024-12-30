    // src/dev/utils/conversation.js

    const Document = require('../db/model/documentModel');
    const { askGPT } = require('./ask');

    /**
     * RAG 방식 예시 함수:
     * 사용자 입력(userInput)을 바탕으로 문서 DB에서 연관 문서 검색 후,
     * 문서 내용 + 사용자 질문을 GPT에 전달하여 답변 생성.
     */
    async function augmentedPrompt(userInput) {
        // 1) DB에서 문서 검색 (예: title에 userInput 단어가 들어가는지)
        const relatedDocs = await Document.find({
            title: { $regex: userInput, $options: 'i' },
        });

        // 2) 검색된 문서 내용을 하나의 텍스트로 합침
        let context = '';
        relatedDocs.forEach((doc) => {
            context += `Title: ${doc.title}\nContent: ${doc.content}\n\n`;
        });

        // 3) GPT에게 전달할 프롬프트 생성
        const prompt = `
    다음은 관련 문서의 내용입니다:
    ${context}

    사용자 질문: ${userInput}

    상기 문서 내용을 참고하여 답변을 작성해 주세요.
        `;

        // 4) GPT 호출
        const result = await askGPT(prompt);
        return result;
    }

    module.exports = { augmentedPrompt };
