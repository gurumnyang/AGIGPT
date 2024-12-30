const Document = require('../../db/model/documentModel');
const Todo = require('../../db/model/todoModel');

/**
 * 명령을 처리하는 함수
 * @param {String} action - 처리할 명령
 * @param {Array} params - 명령에 필요한 파라미터
 */
async function handleCommand(action, params) {
    console.log(`action: ${action}, params: ${params}`);

    switch (action) {
        case 'open_document':
            return await openDocument(params[0]);
        case 'list_documents':
            return await listDocuments();
        case 'create_document':
            return await createDocument(params[0], params[1]);
        case 'update_document':
            return await updateDocument(params[0], params[1]);
        case 'add_todo':
            return await addTodo(params[0]);
        case 'done_todo':
            return await doneTodo(params[0]);
        default:
            throw new Error(`Unknown action: ${action}`);
    }
}

async function openDocument(documentName) {
    try {
        const document = await Document.findOne({ title: documentName });
        if (!document) {
            throw new Error(`Document with name ${documentName} not found`);
        }
        console.log(`Opening document: ${documentName}`);
        return document;
    } catch (error) {
        console.error(`Error opening document: ${error.message}`);
        throw error;
    }
}

async function listDocuments() {
    try {
        const documents = await Document.find();
        console.log('Listing all documents');
        return JSON.stringify(documents);
    } catch (error) {
        console.error(`Error listing documents: ${error.message}`);
        throw error;
    }
}

async function createDocument(title, content) {
    try {
        const newDocument = await Document.create({ title, content });
        console.log(`Creating document: ${newDocument.title}`);
        return `successfully created`;
    } catch (error) {
        console.error(`Error creating document: ${error.message}`);
        throw error;
    }
}

async function updateDocument(documentName, documentContent) {
    try {

        if(typeof documentContent === 'string') {
            //json인지 판별 
            try {
                documentContent = JSON.parse(documentContent);
            } catch (error) {
                documentContent = { content: documentContent};
            }
        }

        const updatedDocument = await Document.findOneAndUpdate(
            { title: documentName },
            documentContent,
            { new: true }
        );
        if (!updatedDocument) {
            throw new Error(`Document with name ${documentName} not found`);
        }
        console.log(`Updating document: ${documentName}`);
        return `successfully updated`;
    } catch (error) {
        console.error(`Error updating document: ${error.message}`);
        throw error;
    }
}

async function addTodo(content) {
    try {
        const todo = await Todo.create({ description: content });
        console.log(`Creating todo: ${todo.description}`);
        return `successfully created`;
    } catch (error) {
        console.error(`Error creating todo: ${error.message}`);
        throw error;
    }
}


//@TODO 검수
async function doneTodo(index) {
    //완료되지 않은 todo 중 index번째 todo를 done처리
    try {
        const todos = await Todo.find({ done: false });
        if (todos.length < index) {
            throw new Error(`Todo with index ${index} not found`);
        }
        const todo = todos[index];
        todo.done = true;
        await todo.save();
        console.log(`Done todo: ${todo.description}`);
        return `TO-DO ${todo.description} is done`;
    } catch (error) {
        console.error(`Error done todo: ${error.message}`);
        throw error;
    }
}

module.exports = handleCommand