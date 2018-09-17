/*
 * @Author: Feng fan
 * @Date: 2018-09-14 14:29:33
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-09-17 16:33:50
 */
const { Agent } = require('http');
const net = require('net');
class PortalAgent extends Agent {
    constructor({ port }) {
        super({
            keepAlive: true
        });
        this.server = net.createServer();
        this.port = port;
        this.sockets = [];
        this._init();
    }

    _init() {
        const self = this;
        const { port, server, _onConnection, _onClose } = this;
        server.on('connection', _onConnection.bind(this));
        server.on('close', _onClose.bind(this));
        server.on('error', (err) => {
            console.log(`server出错了：${err.message}`);
            server.close();
        });
        this.address = new Promise(function (resolve, reject) {
            server.listen(port || 0, '0.0.0.0', () => {
                const address = server.address();
                self.address = address;
                console.log('服务已启动：', address);
                resolve(address);
            })
        });
    }

    _onConnection(socket) {
        this.sockets.push(socket);
        socket.on('end', () => {
            socket.destroy();
        });
        socket.on('error', (err) => {
            if (err.code !== 'ECONNRESET') {
                console.error("socket出错了：", err.message);
            }
            socket.destroy();
        });
        socket.on('close', () => {
            const destroyed = this.sockets.every((socket) => {
                return socket.destroyed;
            });
            destroyed && this.server.close();
        })
    }

    _onClose() {
        if (this.destroyed) {
            return;
        }
        this.destroy();
        this.destroyed = true;
    }

    createConnection(options, cb) {
        let sock = this.sockets.shift();

        if (!sock) {
            this.server.close();
            return;
        }
        
        while (sock && sock.destroyed) {
            sock = this.sockets.shift();
        }
        
        cb(null, sock);
    }
}

module.exports = PortalAgent;
