/*
 * @Author: Feng fan
 * @Date: 2018-11-21 14:47:08
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-12-26 23:05:46
 */
const IO = require('socket.io');
const redisAdapter = require('socket.io-redis');

// 传入http server 
module.exports = (server) => {
  const io = new IO(server, {
    path: '/'
  });
  io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
  return io;
}