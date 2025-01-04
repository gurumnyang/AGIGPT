const Document = require('../../db/model/documentModel');
const Todo = require('../../db/model/todoModel');

async function openDocument({ title }) {
    try {
        if(typeof title !== 'string') {
            throw new Error('title must be a string');
        }

        title = title.trim();
        const document = await Document.findOne({ title });
        if (!document) {
            throw new Error(`Document with name ${title} not found`);
        }
        console.log(`Opening document: ${title}`);
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

        const processedDocuments = documents.map(doc => ({
            _id: doc._id,
            title: doc.title,
            content: doc.content.substring(0, 10) + '...'
        }));

        return JSON.stringify(processedDocuments, null, 2);
    } catch (error) {
        console.error(`Error listing documents: ${error.message}`);
        throw error;
    }
}

async function createDocument({ title, content }) {
    try {
        title = title.trim();
        const newDocument = await Document.create({ title, content });
        console.log(`Creating document: ${newDocument.title}`);
        return `successfully created`;
    } catch (error) {
        console.error(`Error creating document: ${error.message}`);
        throw error;
    }
}

async function updateDocument({ title, content }) {
    try {
        if (typeof content === 'string') {
            //json인지 판별 
            try {
                content = JSON.parse(content);
            } catch (error) {
                content = { content };
            }
        }

        title = title.trim();

        const updatedDocument = await Document.findOneAndUpdate(
            { title },
            content,
            { new: true }
        );
        if (!updatedDocument) {
            throw new Error(`Document with name ${title} not found`);
        }
        console.log(`Updating document: ${title}`);
        return `successfully updated`;
    } catch (error) {
        console.error(`Error updating document: ${error.message}`);
        throw error;
    }
}

async function deleteDocumentByTitle({ title }) {
    try {
        title = title.trim();
        const deletedDocument = await Document.findOneAndDelete({ title });
        if (!deletedDocument) {
            throw new Error(`Document with name ${title} not found`);
        }
        console.log(`Deleting document: ${title}`);
        return `successfully deleted`;
    } catch (error) {
        console.error(`Error deleting document: ${error.message}`);
        throw error;
    }
}

async function deleteDocumentById({ id }) {
    try {
        const deletedDocument = await Document.findByIdAndDelete(id);
        if (!deletedDocument) {
            throw new Error(`Document with id ${id} not found`);
        }
        console.log(`Deleting document with id: ${id}`);
        return `${id} successfully deleted`;
    } catch (error) {
        console.error(`Error deleting document: ${error.message}`);
        throw error;
    }
}

async function addTodo({ content }) {
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
async function doneTodo({ index }) {
    //완료되지 않은 todo 중 index번째 todo를 done처리
    try {
        const todos = await Todo.find({ done: false });
        if (todos.length < index) {
            throw new Error(`Todo with index ${index} not found`);
        }
        console.log(todos);
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

function exit(agent) {
    return function() {
        console.log('Exiting');
        agent.STOPSIGNAL = true;
        return 'exiting';
    }
}

module.exports = {
    openDocument,
    listDocuments,
    createDocument,
    updateDocument,
    deleteDocumentByTitle,
    deleteDocumentById,
    addTodo,
    doneTodo,
    exit
};