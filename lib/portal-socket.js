/*
 * @Author: ImmortalLark
 * @Date: 2018-11-21 14:47:08
 * @Last Modified by: ImmortalLark
 * @Last Modified time: 2018-12-27 10:02:22
 */
const IO = require('socket.io');

// 传入http server 
module.exports = (server) => {
  const io = new IO(server, {
    path: '/'
  });
  return io;
}