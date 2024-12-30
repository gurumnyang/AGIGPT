const socketIo = require('socket.io');

const masterAgent = require('./interface/masterAgent');

class Socket {
    constructor() {
        if (!Socket.instance) {
            this.io = null;
            Socket.instance = this;
        }
        masterAgent.setSocket(this);
        return Socket.instance;
    }

    init(server) {
        this.io = socketIo(server);
        this.io.on('connection', (socket) => {
            console.log('A user connected');

            //유저가 서버에 프롬프트를 전송하는 이벤트
            socket.on('userPrompt', (data) => {
                masterAgent.handleUserCommand(data.message);
            });

            //emit conversationUpdate event 있음
            //socket.emit('conversationUpdate', obj);

            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });
    }

    getInstance() {
        return this.io;
    }
}

const instance = new Socket();

module.exports = instance;