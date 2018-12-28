/*
 * @Author: Feng fan
 * @Date: 2018-09-03 14:37:12
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-11-23 19:18:08
 * 连接管理器，管理连接的数量和生命周期
 */
const stringRandom = require('string-random');
const Connection = require('./connection');
/**
 * 以子域名为维度管理和不同客户端的连接
 * @class connectionManager
 */
class ConnectionManager {
  /**
   *Creates an instance of connectionManager.
   * @param {Object} io socket.io的实例
   * @memberof ConnectionManager
   */
  constructor(io) {
    this.connections = new Map();
    this.io = io;
  }
  /**
   * 通过subdomain创建一个新的服务
   * @param {string} subdomain
   * @memberof ConnectionManager
   */
  createConnection({ subdomain, ctx }) {
    const { connections, io } = this;
    let connection = this.getConnection(subdomain);
    // 如果该子域名已创建过，重新生成一个随机子域名
    while (!subdomain || connections.has(subdomain)) {
      subdomain = stringRandom(3, { numbers: false }).toLowerCase();
    }
    // 实例化对应域名的connection
    connection = new Connection(io, subdomain);
    connection.on('destroy', () => {
      this.removeConnection(subdomain);
    });
    connections.set(subdomain, connection);
    return subdomain;
  }

  /**
   * 通过subdomain获取一个仍活跃的服务
   * @param {string} subdomain
   * @memberof connectionManager
   */
  getConnection(subdomain) {
    return this.connections.get(subdomain);
  }

  /**
   * 移除已关闭的服务
   * @memberof connectionManager
   */
  removeConnection(subdomain) {
    return this.connections.delete(subdomain);
  }
}
module.exports = ConnectionManager;