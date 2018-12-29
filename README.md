## portal-server
portal远端服务，负责转发请求及管理和客户端的连接

### 项目架构
![portal](https://p1.music.126.net/IXF1NONMG2HBxEPQma__NQ==/109951163753411807.png)

[查看portal-client点这里](https://g.hz.netease.com/NeteaseMusicUI/portal/client)

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

[查看nginx 配置](https://g.hz.netease.com/musictest/nginx-conf/blob/master/sites-available/portal-music)

```nginx
# nginx 配置
upstream socket_nodes {
    ip_hash;
    server hzbdg-music-overmind110.server.163.org:2000;
    server hzbdg-music-overmind110.server.163.org:2001;
}

upstream http_nodes {
    ip_hash;
    server hzbdg-music-overmind110.server.163.org:3000;
    server hzbdg-music-overmind110.server.163.org:3001;
}
server {
    server_name ~^(\D+\.)?portal\.qa.igame.163.com;
    access_log /home/srv/log/music-portal-access.log main;
    error_log /home/srv/log/music-portal-error.log;

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

