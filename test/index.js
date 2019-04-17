const http = require('http');
const should = require('should');
const IO = require('socket.io');
const ConnectionManager = require('../lib/connection-manager');

const request = function (options, callback) {
  const req = http.request(options, (res) => {
    let chunks = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      chunks += chunk.toString();
    });
    res.on('end', ()=> {
      callback(chunks);
    });
  });
  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    done(e);
  });
  req.end();   
};
// 测试子域名请求api
describe('subdomain request', function () {
  it('should return "sub"', function (done) {
    request({
      hostname: 'localhost',
      port: 3000,
      path: '/portal/connect?subdomain=sub',
      method: 'GET'
    }, (chunks) => {
      JSON.parse(chunks).should.have.property('subdomain', 'sub');
      done();
    });   
  });

  it('should not return "sub"', function (done) {
    request({
      hostname: 'localhost',
      port: 3000,
      path: '/portal/connect?subdomain=sub',
      method: 'GET'
    }, (chunks) => {
      should.notEqual(JSON.parse(chunks).subdomain, 'sub');
      done();
    });   
  });

  it('should have property "subdomain"', function (done) {
    request({
      hostname: 'localhost',
      port: 3000,
      path: '/portal/connect',
      method: 'GET'
    }, (chunks) => {
      JSON.parse(chunks).should.have.property('subdomain');
      done();
    });   
  });
});
// 测试 ConnectionManager类
describe('connection manager', function () {
  const connectionManager = new ConnectionManager(new IO());
  it('should return "sub"', function () {
    const subdomain = connectionManager.createConnection({ subdomain: 'sub'});
    should.equal(subdomain, 'sub');
  });

  it('should not return "sub"', function () {
    const subdomain = connectionManager.createConnection({ subdomain: 'sub'});
    should.notEqual(subdomain, 'sub');
  });

  it('should return any string', function () {
    const subdomain = connectionManager.createConnection({});
    subdomain.should.be.ok();
  });

  it('connection should be "sub"', function () {
    const connection = connectionManager.getConnection('sub');
    connection.should.have.property('subdomain', 'sub');
  });

  it('connection "xxx" should not exist', function () {
    const connection = connectionManager.getConnection('xxx');
    should.not.exist(connection);
  });
});
// 