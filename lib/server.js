/*
 * @Author: Feng fan
 * @Date: 2018-09-03 14:37:18
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-09-03 19:12:58
 * 连接类，创建tcp服务并处理相关事件
 */
const net = require('net');
class Server {
    constructor(resolve) {
        this.address;
        this.server = net.createServer();
        this._init();
    }

    _init() {
        const self = this;
        const { server, _onConnection, _onClose } = this;
        this.closed = false;
        this.waitingForConnect = true;
        server.on('connection', _onConnection.bind(this));
        server.on('close', _onClose.bind(this));
        server.on('error', (err) => {
            throw err;
        });
        this.address = new Promise(function (resolve, reject) {
            server.listen(0, '0.0.0.0', () => {
                const address = server.address();
                self.address = address;
                console.log('服务已启动：', address);
                resolve(address);
            })
        });
    }

    _onConnection(socket) {
        this.socket = socket;
        socket.on('end', () => {
            console.log('连接已断开');
            delete this.socket;
        });
        socket.on('data', (data) => {
            console.log(data.toString());
            // @todo 数据传给访问者
        })
        socket.on('error', (err) => {
            console.error(err);
        })
        
    }

    _onClose() {
        this.closed = true;
    }

    /**
     * 请求转发到portal客户端
     * @memberof Server
     */
    transmit() {
        const { socket } = this;
        socket.write('transmit');
    }
}
module.exports = Server;