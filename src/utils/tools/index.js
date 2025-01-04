const handler = require('./handler');


class Tools {
    constructor(agent) {
        this.agent = agent;
        
        this._tools = [
            {
                name: "open_document",
                description: "Open a document by title",
                parameters: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "The exact title of the document" },
                    },
                    required: ["title"],
                },
                function: handler.openDocument,
            },
            {
                name: "list_documents",
                description: "List all documents",
                parameters: {},
                function: handler.listDocuments,
            },
            {
                name: "create_document",
                description: "Create a new document",
                parameters: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "The title of the document" },
                        content: { type: "string", description: "The content of the document" },
                    },
                    required: ["title", "content"],
                },
                function: handler.createDocument,
            },
            {
                name: "update_document",
                description: "Update an existing document",
                parameters: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "The title of the document" },
                        content: { type: "string", description: "The new content of the document" },
                    },
                    required: ["title", "content"],
                },
                function: handler.updateDocument,
            },
            {
                name: "delete_document_title",
                description: "Delete a document by title",
                parameters: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "The title of the document" },
                    },
                    required: ["title"],
                },
                function: handler.deleteDocumentByTitle,
            },
            {
                name: "delete_document_id",
                description: "Delete a document by ID",
                parameters: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "The ID of the document" },
                    },
                    required: ["id"],
                },
                function: handler.deleteDocumentById,
            },
            {
                name: "add_todo",
                description: "Add a new todo item",
                parameters: {
                    type: "object",
                    properties: {
                        content: { type: "string", description: "The content of the todo item" },
                    },
                    required: ["content"],
                },
                function: handler.addTodo,
            },
            {
                name: "done_todo",
                description: "Mark a todo item as done",
                parameters: {
                    type: "object",
                    properties: {
                        index: { type: "number", description: "The index of the todo item" },
                    },
                    required: ["index"],
                },
                function: handler.doneTodo,
            },
            {
                name: "exit",
                description: "Exit the agent",
                parameters: {},
                function: handler.exit(this.agent),
            }
        ];

        this.list = this.getFunctionList();
    }

    getFunctionList() {
        return this._tools.map(tool => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
            },
        }));
    }

    /**
     * 특정 도구를 찾아서 실행합니다.
     * @param {string} toolName - 실행할 도구의 이름
     * @param {Object} parameters - 도구에 전달할 매개변수
     * @returns {*} 도구의 실행 결과
     * @throws {Error} 도구를 찾을 수 없는 경우
     */
    handler(toolName, parameters) {
        console.log('Handling tool:', toolName);
        console.log(toolName, parameters);

        const tool = this._tools.find(tool => tool.name === toolName);
        if (!tool) {
            throw new Error(`Tool ${toolName} not found`);
        }
        return tool.function(parameters);
    }

    /**
     * @typedef {Object} ToolCallResult
     * @property {Array} toolCallId - 도구 호출의 ID들
     * @property {string} toolName - 도구의 이름
     * @property {string|null} error - 오류 메시지 (있을 경우)
     * @property {Array} content - 도구 실행 결과
     */

    /**
     * 응답을 처리하고 필요한 경우 도구를 호출합니다.
     * @param {Object} response - 처리할 응답 객체
     * @returns {Promise<ToolCallResult>} 도구의 실행 결과 또는 null
     * @throws {Error} 응답이 비어 있거나 도구 호출을 찾을 수 없는 경우
     */
    async handleResponse(response) {
        if(!response) throw new Error('Response is empty');
        if(!response.choices || response.choices.length === 0) return null;
        const willInvokeFunction = response.choices[0].finish_reason === 'tool_calls';
        if(!willInvokeFunction) return null;

        console.log('Invoking tool function');
        const toolCalls = response.choices[0]?.message?.tool_calls || [];
        const toolCallIds = [];
        const contents = [];
        let errorMessage = null;

        for (let i = 0; i < toolCalls.length; i++) {
            try {
                const call = toolCalls[i];
                const toolName = call?.function?.name;
                const rawArgument = call?.function?.arguments;
                let argument = {};
                if(rawArgument) argument = JSON.parse(rawArgument);
                toolCallIds.push(call.id);

                const singleResult = await this.handler(toolName, argument);

                // JSON이면 보기 좋게 변환
                let output = singleResult;
                if(typeof singleResult === 'object') {
                    output = JSON.stringify(singleResult, null, 2);
                }
                contents.push(`${i}: ${output}`);
            } catch (err) {
                console.error('Error handling tool:', err.message);
                errorMessage = err.message;
                contents.push(`${i}: Error: ${err.message}`);
            }
        }

        return {
            toolCallId: toolCallIds,
            toolName: (toolCallIds.length > 1) ? '"multipleToolCalls"' : toolCalls[0].tool_name,
            error: errorMessage,
            content: contents
        };
    }
}

module.exports = Tools;