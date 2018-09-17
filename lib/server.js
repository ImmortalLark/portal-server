/*
 * @Author: Feng fan
 * @Date: 2018-09-14 14:29:39
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-09-17 16:55:52
 */
/*
 * @Author: Feng fan
 * @Date: 2018-09-03 14:37:18
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-09-14 14:11:19
 * 连接类，创建tcp服务并处理相关事件
 */
const http = require('http');
const pump = require('pump');
const PortalAgent = require('./portal-agent');

class Server {
    constructor({ port }) {
        this.agent = new PortalAgent({ port });
    }
    
    /**
     * 请求转发到 portal 客户端
     * @memberof Server
     */
    transmit({ req, res }) {
        const self = this;
        const options = {
            path: req.url,
            agent: self.agent,
            method: req.method,
            headers: req.headers
        };
        const clientReq = http.request(options, (clientRes) => {
            res.writeHead(clientRes.statusCode, clientRes.headers);
            pump(clientRes, res);
        });
        pump(req, clientReq, (e) => {
            e && console.log(e)
        });
    }
}
module.exports = Server;