// src/dev/utils/agent.js
const Document = require('../db/model/documentModel');
const Todo = require('../db/model/todoModel');
const Result = require('../db/model/resultModel');
const { askGPT } = require('./ask');
const commandHandler = require('./command');
const openaiTokenCounter = require('openai-gpt-token-counter');

function createMessage(role, content) {
    return { role, content };
}
function userMsg(prompt) {
    return createMessage('user', prompt);
}
function systemMsg(prompt) {
    return createMessage('system', prompt);
}
function gptMsg(prompt) {
    return createMessage('assistant', prompt);
}

/**
 * AI 명령 처리를 담당하는 자율 에이전트
 * 1. 사용자 메시지 + DB 문서 + TODO 문서 + RESULT 문서 참조
 * 2. GPT 프롬프트 생성
 * 3. GPT 응답을 토대로 TODO 또는 RESULT 업데이트
 * 4. 완료 시 결과 반환
 */
class Agent {
    constructor() {
        this.children = [];
        this.systemPrompt = `
You are an autonomous RAG agent operating under the following rules:

1. 1. Analyze the user's request, break it down into detailed tasks, and create individual to-do items. Then, retrieve necessary documents from the database's document list, todo document, and result document as required.
2. Fetch documents from the database, and if needed, create or modify a todo document to record tasks that need to be completed.
3. Each time a task recorded in the todo document is executed, sequentially log the process in the result document.
4. When all tasks are deemed complete, summarize the final results in the result document and return the results to the user.
5. For document retrieval/creation/modification, you can use the following commands:
- open_document(title:String)
- list_documents()
- create_document(title:String, content:String)
- update_document(title:String, content:String)
- add_todo(content:String) 
- done-todo(index:Number) //0부터 시작


**<Template 1>**
{command:[command to be filled]}
If you want to execute the command, append the command in the format of <Template 1> at the end of your response and send it.
After executing the command, confirm the results in the system prompt and proceed with the next task.

**<Example 1>**
User input: "테스트 문서를 열어줘"
---
GPT response:
테스트 문서를 열겠습니다.
{command:open_document("테스트 문서")}
---
System response:
[Document content in JSON format]
---
GPT:
[Proceed with tasks]
---

6. For RAG, refer to any necessary documents by searching the database.
        `;
        this._conversation = [];
        this.socket = null;
    }

    get conversation () {
        return this._conversation;
    }

    addConversation (message) {
        // console.log(`${message.role}:${message.content}`);
        if (this.socket) {
            this.socket.io.emit('conversationUpdate', message);
        }
        this._conversation.push(message);
    }

    setSocket(socket) {
        this.socket = socket;
        console.log('agent: socket communication enabled');
    }

    async handleUserCommand(userInput) {
        // (1) 문서 목록, TODO 목록, RESULT 목록 불러오기
        const allDocs = await Document.find({}, 'title'); // 제목만
        const todoList = await Todo.find({}, 'description');
        const resultList = await Result.find();

        // (2) prompt 구성 (System + User + Context)
        let systemPrompt = "";
        if(this.conversation.length == 0){
            systemPrompt = this.systemPrompt
        }
        
        systemPrompt+= `
<Current Context>
- Documents List: ${allDocs.map(d => d.title).join(', ')}
- Current TODO list: ${JSON.stringify(todoList, null, 2)}
- Current RESULT list: ${JSON.stringify(resultList, null, 2)}`;
        
        this.addConversation(systemMsg(systemPrompt));
        this.addConversation(userMsg(userInput));

        // (3) GPT에게 질문
        while (true) {
            this.manageConversation()
            const gptResponse = await askGPT(this.conversation);
            this.addConversation(gptMsg(gptResponse));
    
            // 명령어 추출
            const commandMatch = gptResponse.match(/\{command:(.*)\}/);
            if (commandMatch) {
                const command = commandMatch[1];
                // 명령어 실행
                const result = await commandHandler.execute(command);
                this.addConversation(systemMsg(JSON.stringify(result, null, 2)));
            } else {
                return gptResponse;
            }
        }
    }

    manageConversation(){
        const messages = {
            user: this.conversation.filter(r => r.role==='user'),
            system: this.conversation.filter(r => r.role==='system'),
            assistant: this.conversation.filter(r => r.role==='assistant')
        }

        const length = {
            total: this.conversation.length,
            user: messages.user.length,
            system: messages.system.length,
            assistant: messages.assistant.length,
        };
        const model = process.env.MODEL || 'gpt-4o-mini'; 

        const token = {
            total: openaiTokenCounter.chat(this.conversation, model),
            user: openaiTokenCounter.chat(messages.user, model),
            system: openaiTokenCounter.chat(messages.system, model),
            assistant: openaiTokenCounter.chat(messages.assistant, model)
        }
        console.table({
            length, token
        });
    } 

    

    createChildAgent() {
        const childAgent = new Agent();
        this.children.push(childAgent);
        return childAgent;
    }
}

module.exports = { Agent };
