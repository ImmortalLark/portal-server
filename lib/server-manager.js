/*
 * @Author: Feng fan
 * @Date: 2018-09-03 14:37:12
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-11-19 15:11:43
 * 连接管理器，管理连接的数量和生命周期
 */
const stringRandom = require('string-random');
const Server = require('./server');
class ServerManager {
    constructor(options = {}) {
        this.servers = new Map();
    }
    
    /**
     * 通过subdomain创建一个新的连接
     * @param {string} subdomain
     * @memberof ServerManager
     */
    createServer({ subdomain, port }) {
        const { servers } = this;
        let server = this.getServer(subdomain);
        if (server && server.agent.destroyed) {
            this.removeServer(subdomain);
        }
        // 如果该子域名已创建过，重新生成一个随机子域名
        while (!subdomain || servers.has(subdomain)) {
            subdomain = stringRandom(3, { numbers: false }).toLowerCase();
        }
        server = new Server({ port });
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
        return this.servers.delete(subdomain);
    }
}
module.exports = ServerManager;