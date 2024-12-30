const parser = require('./parser');
const handler = require('./handler');

async function execute(command) {
    const {action, params} = parser(command);
    try {
        const result = await handler(action, params);
        return result;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

module.exports = {
    execute
};