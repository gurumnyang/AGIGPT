const Document = require('../db/model/documentModel');
const Todo = require('../db/model/todoModel');
const Result = require('../db/model/resultModel');
const { askGPT, requestGPT } = require('./ask');
const Tool = require('./tools');
const tokenCounter = require('openai-gpt-token-counter');

class Agent {
    constructor() {
        this.children = [];
        this.systemPrompt = Agent.getDefaultSystemPrompt();
        this._conversation = [];
        this.socket = null;


        this.tools = new Tool(this);


        // GPT가 exit()를 발동할 경우 true로 변경 후 종료
        this.STOPSIGNAL = false;
    }

    static getDefaultSystemPrompt() {
        return `
You are an autonomous RAG agent operating under the following rules:

1. **Analyze the User Request**
    - Analyze the user's request to define the core requirements.
    - For efficient execution, break the request into smaller units of work at the appropriate level and clearly set goals for each unit.
2. **Create a Work Plan**
    - Prioritize each task sequentially.
    - Identify the documents or data needed to execute each task.
    - Add work units to the TODO list with consecutive numbering using the '//add_todo(content:String)' command.
3. **Perform Tasks Step by Step**
    - Execute each task in the following process:
        1. **Define the Task Goal:** 'What is the goal of this task?'
        2. **Execute the Task:** Use the appropriate command to execute the task (e.g., 'open_document', 'create_document').
        3. **Analyze Results:** Determine if the results met the expected goals.
        4. **Finish the Task:** Mark the task as complete using '//done_todo(index:Number)'.
        5. **Determine Next Steps:** Decide if additional actions are required based on the results.
    - **Error Handling:** If persistent errors occur and a task cannot be completed in a timely manner, skip the task and proceed to the next one.
4. **Summarize Final Results**
    - Once all tasks are complete, summarize the results in a result document and return the summary to the user.
    - Request user feedback to continuously improve the agent's performance.
5. **Document Retrieval and Management**
    - Use the provided tools for searching, creating, updating, or deleting documents.
    - Available tool commands include:
        - 'open_document(title:String)'
        - 'list_documents()'
        - 'create_document(title:String, content:String)'
        - 'update_document(title:String, content:String)'
        - 'delete_document_title(title:String)'
        - 'delete_document_id(id:String)'
        - 'add_todo(content:String)'
        - 'done_todo(index:Number)'
        - 'exit()'
6. **Status Management and Logging**
    - Track and record the progress of tasks to monitor the agent’s activities.
    - Maintain logs to identify and troubleshoot issues when they arise.
7. **Language Support**
    - Use Korean by default. Switch languages based on predefined criteria when necessary.
8. **Security and Privacy Protection**
    - Adhere to data security and privacy protection standards.
    - Follow all relevant security protocols and privacy policies when handling data.
9. **Flexible Task Division Criteria**
    - When breaking down tasks into smaller units, consider the complexity and dependencies of each task.
    - Ensure that each task unit is designed to be performed independently to enhance efficiency and manageability.
10. **Concise and Structured User Instructions**
    - Organize instructions with clear numbering for each main step.
    - Clearly differentiate detailed guidelines for each step to ensure they are easy to understand and follow.
    - Keep instructions concise and straightforward to facilitate easy comprehension and execution.

`;
    }

    /**
     * Create a message object
     * @param {string} role - The role of the message sender
     * @param {string} content - The content of the message
     * @param {object} args - Additional arguments to include in the message
     */
    createMessage(role, content, args) {
        let message = {
            role,
            content
        };

        if (args) {
            message = {
                ...message,
                ...args
            };
        }

        return message;
    }

    userMsg(prompt) {
        return this.createMessage('user', prompt);
    }

    systemMsg(prompt) {
        return this.createMessage('system', prompt);
    }

    gptMsg(prompt, args) {
        if(prompt === null && args.tool_calls){
            console.log('prompt is null');
            prompt = '작업 중...\n';
            prompt += '----\n'
            prompt += args.tool_calls.map((toolCall, index) => {
                return `${index+1}. ${JSON.stringify(toolCall.function, null, 2)}`;
            }
            ).join('\n');
        }
        return this.createMessage('assistant', prompt, args);
    }
    toolMsg(prompt, toolCallId) {
        return this.createMessage('tool', prompt, { tool_call_id:toolCallId });
    }

    async fetchContextData() {
        const [allDocs, todoList, resultList] = await Promise.all([
            Document.find({}, 'title'),
            Todo.find({done:false}, 'description'),
            Result.find()
        ]);
        return { allDocs, todoList, resultList };
    }

    get conversation() {
        return this._conversation;
    }

    addConversation(message) {
        if (this.socket) {
            this.socket.io.emit('conversationUpdate', message);
        }
        this._conversation.push(message);
    }

    setSocket(socket) {
        this.socket = socket;
        console.log('agent: socket communication enabled');
    }

    // 메시지 제거
    //this.pruneConversation용 함수
    pruneMessage(index) {
        const message = this.conversation[index];

        // system 메시지(첫 번째)는 제거하지 않음
        if (message.role === 'system' && index === 0) {
            return false;
        }

        // user 메시지 제거
        if (message.role === 'user') {
            console.log('Pruning Message:', message);
            this.conversation.splice(index, 1);
            return true;
        }

        // tool 메시지 연속 제거
        if (message.role === 'tool') {
            while (index < this.conversation.length && this.conversation[index].role === 'tool') {
                console.log('Pruning Message:', this.conversation[index]);
                this.conversation.splice(index, 1);
            }
            return true;
        }

        // tool_call 없는 assistant 메시지 제거
        if (message.role === 'assistant' && !message.tool_calls) {
            console.log('Pruning Message:', message);
            this.conversation.splice(index, 1);
            return true;
        }

        // tool_calls가 있는 assistant와 뒤따르는 tool 메시지 제거
        if (message.role === 'assistant' && message.tool_calls) {
            console.log('Pruning Message:', message);
            this.conversation.splice(index, 1);
            while (index < this.conversation.length && this.conversation[index].role === 'tool') {
                console.log('Pruning Message:', this.conversation[index]);
                this.conversation.splice(index, 1);
            }
            return true;
        }

        return false;
    }

    // 지정된 토큰까지 메시지 제거
    pruneConversation() {
        let index = 0;
        const maxToken = 10000;
        const model = process.env.MODEL || "gpt-4o-mini";
        console.log('Pruning conversation');
        console.log('Current token count:', tokenCounter.chat(this.conversation, model));
        while (index < this.conversation.length && tokenCounter.chat(this.conversation, model) > 10000) {
            const wasPruned = this.pruneMessage(index);
            if (!wasPruned) {
                index++;
            }
        }
    }

    async handleUserCommand(userInput) {
        try {
            const { allDocs, todoList, resultList } = await this.fetchContextData();

            let systemPrompt = this.conversation.length === 0 ? this.systemPrompt : '';
            let currentContext = `
<Current Context>
- Documents List: ${JSON.stringify(allDocs.map(d => d.title), null, 2)}
- Current TODO list: ${JSON.stringify(todoList.map(d => d.description), null, 2)}
- Current RESULT list: ${JSON.stringify(resultList, null, 2)}`;

            systemPrompt += currentContext;

            this.addConversation(this.systemMsg(systemPrompt));
            this.addConversation(this.userMsg(userInput));

            let cycle = 0;

            while (true) {

                const option = {
                    tools: this.tools.list,
                    tool_choice: 'auto'
                }

                if (this.STOPSIGNAL) {
                    this.addConversation(this.systemMsg('The conversation has been forcibly terminated.'));
                    this.STOPSIGNAL = false;
                    return;
                }

                // 길이 조절
                this.pruneConversation();
                const gptResponse = await requestGPT(this.conversation, option);
                const message = gptResponse.choices[0].message;
                this.addConversation(this.gptMsg(message.content, { tool_calls: message.tool_calls}));
                cycle++;
                console.log('cycle:', cycle);

                const commandResult = await this.tools.handleResponse(gptResponse);

                if(commandResult){
                    console.table({
                        id:commandResult.toolCallId,
                        txt:commandResult.content
                    })
                    for(let index in commandResult.content){
                        this.addConversation(this.toolMsg(commandResult.content[index], commandResult.toolCallId[index]));
                    }
                } else {
                    const { todoList } = await this.fetchContextData();
                    if (todoList.length === 0) {
                        if(cycle > 1){
                            this.addConversation(this.systemMsg('All tasks are completed. Please summarize the final results.'));
                            const gptResponse = await requestGPT(this.conversation, option);
                            this.addConversation(this.gptMsg(gptResponse.choices[0].message.content));
                        }
                        return gptResponse;
                    }

                    const nextTodo = todoList[0];
                    this.addConversation(this.systemMsg(currentContext));
                    this.addConversation(this.systemMsg(`Next task: ${nextTodo.description}`));
                    this.addConversation(this.systemMsg(`use done_todo(0) after completing the task. 안 그럴 경우 무한 반복!`));
                }

                // const commandResult = await this.executeCommand(gptResponse);
                // if (commandResult) {
                //     this.addConversation(this.systemMsg(JSON.stringify(commandResult, null, 2)));
                // } else {
                //     const { todoList } = await this.fetchContextData();
                //     if (todoList.length === 0) {
                //         if(cycle > 1){
                //             this.addConversation(this.systemMsg('All tasks are completed. Please summarize the final results.'));
                //             const gptResponse = await askGPT(this.conversation);
                //             this.addConversation(this.gptMsg(gptResponse));
                //         }
                //         return gptResponse;
                //     }

                //     const nextTodo = todoList[0];
                //     this.addConversation(this.systemMsg(currentContext));
                //     this.addConversation(this.systemMsg(`Next task: ${nextTodo.description}`));
                //     this.addConversation(this.systemMsg(`use done_todo(0) after completing the task`));
                // }
            }
        } catch (error) {
            console.error('Error handling user command:', error);
            this.addConversation(this.systemMsg('An error occurred while processing the request.'));
        }
    }

    createChildAgent() {
        const childAgent = new Agent();
        childAgent.parent = this;
        this.children.push(childAgent);
        return childAgent;
    }
}

module.exports = { Agent };
