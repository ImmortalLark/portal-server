/*
 * @Author: Feng fan
 * @Date: 2018-09-03 14:37:18
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-09-05 18:30:30
 * 连接类，创建tcp服务并处理相关事件
 */
const net = require('net');
class Server {
    constructor({ port }) {
        // 连接是否断开
        this.closed = false;
        // 是否还未连接
        this.waitingForConnect = true;
        this.server = net.createServer();
        this._init({ port });
    }

    _init({ port }) {
        const self = this;
        const { server, _onConnection, _onClose } = this;
        server.on('connection', _onConnection.bind(this));
        server.on('close', _onClose.bind(this));
        server.on('error', (err) => {
            throw err;
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
        this.socket = socket;
        socket.on('connect', () => {
            this.waitingForConnect = false;
        })
        socket.on('end', () => {
            console.log('连接已断开');
            this.closed = true;
            delete this.socket;
        });
        socket.on('error', (err) => {
            console.error("error===", err);
        })
    }

    _onClose() {
        this.closed = true;
    }

    /**
     * 请求转发到 portal 客户端
     * @memberof Server
     */
    transmit(ctx) {
        const { socket } = this;
        const buffer = new Buffer(JSON.stringify({req: ctx.request, body: ctx.request.body}), 'utf8');
        return new Promise((resolve) => {
            socket.on('data', (data) => {
                resolve(JSON.parse(data));
            });
            socket.write(buffer);
        });
    }
}
module.exports = Server;