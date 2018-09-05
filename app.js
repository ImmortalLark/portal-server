/*
 * @Author: Feng fan
 * @Date: 2018-09-03 14:37:21
 * @Last Modified by: Feng fan
 * @Last Modified time: 2018-09-05 09:31:45
 */
const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const ServerManager = require('./lib/server-manager');

const PORT = process.argv[2];
const supdomain = process.argv[3];
const maxServerCount = process.argv[4];

const app = new Koa();
const router = new Router();
const serverManager = new ServerManager({ maxServerCount });

// api request 
router.get('/portal/connect', async (ctx) => {
    let { subdomain, port } = ctx.query;
    const result = serverManager.createServer({ subdomain, port });
    if (!result) {
        ctx.body = {
            msg: "已达到最大连接数"
        }
        return;
    }
    const { server } = result;
    const address = await server.address;
    subdomain = result.subdomain;
    port = address.port;
    ctx.body = { domain: `${subdomain}.${supdomain}`, port: address.port };
});

app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());
// 转发请求至对应的客户端
app.use(async (ctx, next) => {
    const subdomain = ctx.host.split(`.${supdomain}`)[0];
    const server = serverManager.getServer(subdomain);
    server && server.transmit(ctx);
    await next();
});

app.listen(PORT || 3000, () => {
    console.log(`开始监听${PORT}端口`);
});