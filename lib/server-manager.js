/*
 * @Author: Feng fan
 * @Date: 2018-09-03 14:37:12
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-09-04 16:14:42
 * 连接管理器，管理连接的数量和生命周期
 */
const stringRandom = require('string-random');
const Server = require('./server');
class ServerManager {
    constructor(options = {}) {
        const { maxServerCount = 10 } = options;
        this.maxServerCount = maxServerCount;
        this.servers = new Map();
    }
    
    /**
     * 通过subdomain创建一个新的连接
     * @param {string} subdomain
     * @memberof ServerManager
     */
    createServer({ subdomain, port }) {
        const { servers, maxServerCount } = this;
        // 检测已创建的连接是否超过最大连接数
        if (servers.size >= maxServerCount) return false;
        // 如果该子域名已创建过，重新生成一个随机子域名
        while (!subdomain || servers.has(subdomain)) {
            subdomain = stringRandom(3, { numbers: false }).toLowerCase();
        }
        let ports = []
        servers.forEach((value) => {
            ports.push(value.address.port);
        });
        // 如果该端口已创建服务，抛弃端口
        ports.includes(+port) && (port = null);
        const server = new Server({ port });
        servers.set(subdomain, server);
        return {
            subdomain,
            server
        }
    }

    /**
     * 通过subdomain获取一个仍活跃的连接
     * @param {string} subdomain
     * @memberof ServerManager
     */
    getServer(subdomain) {
        return this.servers.get(subdomain);
    }
    
    /**
     * 移除已关闭的连接
     * @memberof ServerManager
     */
    removeServer(subdomain) {
        const server = this.getServer(subdomain);
        if (server && server.closed) {
            return this.servers.delete(subdomain);
        }
        return false;
    }
}
module.exports = ServerManager;