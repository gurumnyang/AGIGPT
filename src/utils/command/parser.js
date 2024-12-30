function parseCommand(command) {
    const commandPattern = /(\w+)\((.*)\)/;
    const match = command.match(commandPattern);

    if (!match) {
        throw new Error("Invalid command format");
    }

    const [, action, params] = match;
    let parsedParams = [];

    if (params) {
        try {
            parsedParams = params.split(',').map(param => param.trim()).map(param => {
                try {
                    return JSON.parse(param);
                } catch {
                    return param;
                }
            });
        } catch (error) {
            throw new Error("Invalid parameter format");
        }
    }

    return {
        action,
        params: parsedParams
    };
}

module.exports = parseCommand;