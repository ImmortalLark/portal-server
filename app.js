/*
 * @Author: Feng fan
 * @Date: 2018-09-03 14:37:21
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-09-21 10:32:05
 */
const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const ServerManager = require('./lib/server-manager');

const PORT = process.argv[2];
const supdomain = process.argv[3] || 'qa.igame.163.com';

const app = new Koa();
const router = new Router();
const serverManager = new ServerManager();

// api request 
router.get('/portal/connect', async (ctx) => {
    let { subdomain, port } = ctx.query;
    const result = serverManager.createServer({ subdomain, port });
    const { server } = result;
    const address = await server.agent.address;
    ctx.body = { 
        subdomain: `${result.subdomain}`,
        port: address.port
    };
});

app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());
// 转发请求至对应的客户端
app.use(async (ctx) => {
    ctx.respond = false;
    const subdomain = ctx.host.split(`.${supdomain}`)[0];
    const server = serverManager.getServer(subdomain);
    if (!server) return;
    if (server.agent.destroyed) {
        serverManager.removeServer(subdomain);
        return;
    }
    server.transmit(ctx);
});

app.listen(PORT || 3000, () => {
    console.log(`开始监听${PORT}端口`);
});