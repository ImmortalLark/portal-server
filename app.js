/*
 * @Author: Feng fan
 * @Date: 2018-09-03 14:37:21
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-11-21 20:54:21
 */
const Koa = require('koa');
const Router = require('koa-router');
const ConnectionManager = require('./lib/connection-manager');
const logger = require('./lib/utils/logger');

const PORT = +process.env.ENV_PORT; // set ENV_PORT=xxx
const supdomain = process.argv[2] || 'portal.qa.igame.163.com';

const app = new Koa();
const router = new Router();
const httpServer = require('http').Server(app.callback());
const io = require('./lib/portal-socket')(httpServer);
let connectionManager = new ConnectionManager(io);

// api request 
router.get('/portal/connect', async (ctx, next) => {
  let { subdomain } = ctx.query;
  subdomain = connectionManager.createConnection({ subdomain, ctx });
  // subdomain有可能更新过，所以用返回的subdomain
  ctx.body = { 
    subdomain
  };
});

app.use(router.routes());
app.use(router.allowedMethods());
// 转发请求至对应的客户端
app.use((ctx) => {
  ctx.respond = false;
  const subdomain = ctx.host.split(`.${supdomain}`)[0];
  const connection = connectionManager.getConnection(subdomain);
  if (!connection) {
    ctx.body = {
      code: 500,
      msg: 'error: no connection'
    }
    return logger.error('no server');
  }
  if (!connection.established) {
    ctx.body = {
      code: 500,
      msg: 'error: connecting'
    }
    return logger.error('no connection');
  }
  connection.transmit(ctx.req);
});

app.listen(PORT || 3000, () => {
  console.log(`开始监听${PORT || 3000}端口`);
})
httpServer.listen(2000, () => {
  console.log(`socket.io 开始监听2000端口`);
});