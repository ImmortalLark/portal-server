## portal-server
portal远端服务，负责转发请求及管理和客户端的连接

### 项目架构
![portal](https://p1.music.126.net/IXF1NONMG2HBxEPQma__NQ==/109951163753411807.png)

[查看portal-client点这里](https://github.com/ImmortalLark/portal-client)

## 启动
macos/linux
```shell
env ENV_PORT=80 && node app.js [domain]
```
windows
```shell
set ENV_PORT=80 && node app.js [domain]
```


## 部署
pm2 cluster + nginx iphash

```nginx
# nginx 配置
upstream socket_nodes {
    ip_hash;
    server server.test.com:2000;
    server server.test.com:2001;
}

upstream http_nodes {
    ip_hash;
    server server.test.com:3000;
    server server.test.com:3001;
}
server {
    server_name ~^(\D+\.)?portal\.server.test.com;
    access_log /home/srv/log/portal-access.log main;
    error_log /home/srv/log/portal-error.log;

    location /socket {
        proxy_pass http://socket_nodes;

        proxy_http_version 1.1;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade; 
        proxy_set_header Connection "upgrade"; 
    }
        
    location / {
        proxy_pass http://http_nodes;
        proxy_set_header Host $http_host;
    }
}

```
使用iphash的原因，请参考[这里](https://segmentfault.com/a/1190000009622158)，如果你的部署环境不需要经过nginx的话，也可以使用pm2 cluster模式并且客户端指定websocket端口直连。或者通过其它方式解决不同进程间的状态同步也可。

