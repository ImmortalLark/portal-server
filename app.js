/*
 * @Author: Feng fan
 * @Date: 2018-09-03 14:37:21
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-09-03 19:12:49
 */
const Koa = require('koa');
const Router = require('koa-router');
const ServerManager = require('./lib/server-manager');

const PORT = process.argv[2];
const supdomain = process.argv[3];

const app = new Koa();
const router = new Router();
const serverManager = new ServerManager();

// api request 
router.get('/api/connect', async (ctx) => {
    const { subdomain, server } = serverManager.createServer();
    const address = await server.address;
    ctx.body = { domain: `${subdomain}.${supdomain}`, port: address.port };
});

app.use(router.routes());
app.use(router.allowedMethods());
// 转发请求至对应的客户端
app.use(async (ctx, next) => {
    const subdomain = ctx.host.split(`.${supdomain}`)[0];
    const server = serverManager.getServer(subdomain);
    server && server.transmit();
    await next();
});

app.listen(PORT || 3000, () => {
    console.log(`开始监听${PORT}端口`);
});