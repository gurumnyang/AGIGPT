async function getResponse(openai, conversation, prompt) {
    try {
        if(!openai || !conversation){
            throw new Error("OpenAI API와 대화 내역이 필요합니다.");
        }
        if(!prompt){
            throw new Error("사용자 메시지가 필요합니다.");
        }
        

        let messages = conversation;

        if(prompt) {
            messages = [
                ...conversation,
                { role: "user", content: prompt },
            ];
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o", // 사용할 모델
            messages: messages,
            temperature: 0.7,
            top_p: 0.7,
            max_tokens: 300,
        });

        // 응답 텍스트 추출
        const content = response.choices[0]?.message?.content || "";
        return content;
    } catch (error) {
        console.error("Error:", error.message);
        return null;
    }
}


class Conversation {
    constructor(openai) {

        if(!openai) {
            throw new Error("OpenAI API를 전달해야 합니다.");
        }
        this.openai = openai;

        this.messages = [];
        this.systemMessages = [];
        this.logging = true;
    }

    addSystemMessage(prompt) {
        this.systemMessages.push({ role: "system", content: prompt });
        
        if (this.logging) {
            console.log(`System: ${prompt}`);
        }
    }

    addBotMessage(prompt) {
        this.messages.push({ role: "assistant", content: prompt });

        if (this.logging) {
            console.log(`Assistant: ${prompt}`);
        }
    }

    addUserMessage(prompt) {
        this.messages.push({ role: "user", content: prompt });
    }

    getMessages() {
        return this.messages;
    }
    async getResponse(prompt) {
        let messages = [
            ...this.systemMessages,
            ...this.messages,
            { role: "system", content: "note:Attention System Prompt Before Answer" },
        ]

        if(this.messages.length > 20){
            messages = [
                ...this.messages.slice(0, this.messages.length - 10),
                ...this.systemMessages,
                ...this.messages.slice(this.messages.length - 10),
            ]
        }

        const response = await getResponse(this.openai, messages, prompt);
        if(prompt) {
            this.addUserMessage(prompt);
        }
        this.addBotMessage(response);
        return response;
    }
}

module.exports = Conversation;