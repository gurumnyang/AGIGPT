const readline = require('./readline.js');
const chatter = require('./chatter.js');
const { askGPT } = require('./ask');
const { augmentedPrompt } = require('./conversation');


module.exports = { 
    readline, 
    Chatter: chatter,
    askGPT,
    augmentedPrompt,
 };