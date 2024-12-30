const {Agent} = require('../utils/agent');

//singleton agent
let masterAgent;

function getMasterAgent() {
    if (!masterAgent) {
        masterAgent = new Agent();
    }
    return masterAgent;
}

module.exports = getMasterAgent();