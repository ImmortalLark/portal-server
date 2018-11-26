/*
 * @Author: Feng fan
 * @Date: 2018-11-21 16:58:05
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-11-26 11:21:40
 */
const EventEmitter = require('events').EventEmitter;
const logger = require('./utils/logger');

/**
 * 管理和客户端的连接
 * @class Connection
 * @extends {EventEmitter}
 */
class Connection extends EventEmitter {
  /**
   * Creates an instance of Connection.
   * @param {Object} io
   * @param {String} subdomain
   * @memberof Connection
   */
  constructor(io, subdomain){
    super();
    this.io = io;
    this.subdomain = subdomain;
    this.established = false;
    this.connect();
  }

  /**
   * io初始化（建立连接，定义事件处理函数）
   * @memberof Connection
   */
  connect() {
    // 将分配的子域名作为命名空间
    this.io
      .of(`/socket/${this.subdomain}`)
      .on('connection', (socket) => {
        socket.on('disconnect', (reason) => {
          logger.debug(reason);
          this.established = false;
          this.socketDestroy();
          this.emit('disconnect');
          this.destroy();
        });
        socket.on('error', (error) => {
          logger.error(error);
          this.socket.disconnect(true);
        });
        // 标识连接已建立
        this.established = true;
        this.socket = socket;
        this.emit('connection');
        logger.info(this.subdomain, 'connetion established');
      });
  }
  
  /**
   * 数据传输方法
   * @param {Objecct} req --http request对象
   * @memberof Connection
   */
  transmit(ctx) {
    return new Promise((resolve, reject) => {
      const { req, request } = ctx;
      // 自定义事件 request，发送来自用户的请求到客户端
      this.socket.emit('portal-request', {
        path: req.url || '/',
        method: req.method,
        headers: req.headers,
        body: request.body
      }, (res) => {
        //传入客户端返回的res对象
        resolve(res);
      });
      logger.debug(this.subdomain, 'transmit message');
    });
  }

  /**
   *  socket断开连接，解绑事件处理函数
   * @memberof Connection
   */
  socketDestroy() {
    this.socket.removeAllListeners(['error', 'disconnect', 'portal-close']);
    logger.debug(this.subdomain, this.socket.id, 'socket destroyed');
    delete this.socket;
  }

  /**
   * 销毁连接
   * @memberof Connection
   */
  destroy() {
    this.emit('destroy');
    logger.info(this.subdomain, 'connection destroyed');
  }
}
module.exports = Connection;