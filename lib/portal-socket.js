/*
 * @Author: Feng fan
 * @Date: 2018-11-21 14:47:08
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-11-21 20:24:05
 */
const IO = require('socket.io');
// 传入http server 
module.exports = (server) => {
  const io = new IO(server, {
    path: '/'
  });
  return io;
}