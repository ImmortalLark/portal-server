const Koa = require('koa');
const ConnectionManager = require('./lib/connection-manager');

const PORT = process.argv[2];
const app = new Koa();

app.use(ConnectionManager);

app.listen(PORT || 3000, () => {
    console.log(`开始监听${PORT}端口`);
});