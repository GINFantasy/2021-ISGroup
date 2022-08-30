# Ngnix

## Linux上安装Ngnix

1. http://nginx.org/

2. 在安装路径上解压

```shell
tar zxvf nginx的名称 
```

3. 进入文件夹,编译安装

```shell
./configure --prefix=/usr/local/nginx
make
make install

# 如果出现错误
# checking for OS
# + Linux 3.10.0-693.el7.x86_64 x86_64
# checking for C compiler ... not found
# ./configure: error: C compiler cc is not found
# 执行
yum install -y gcc

#./configure: error: the HTTP rewrite module requires the PCRE library.
# You can either disable the module by using --without-http_rewrite_module#
#option, or install the PCRE library into the system, or build the PCRE #library
#statically from the source with nginx by using --with-pcre=<path> option.
#执行
yum install -y pcre pcre-devel

#/configure: error: the HTTP gzip module requires the zlib library.
#You can either disable the module by using --without-http_gzip_module
#option, or install the zlib library into the system, or build the zlib #library
#statically from the source with nginx by using --with-zlib=<path> option.
# 执行
yum install -y zlib zlib-devel

#然后
make
make install

```

3. 启动Nginx

```shell
# 进入目录 /usr/local/nginx/sbin
./nginx
```

4. 防火墙

```shell 
systemctl stop firewalld.service
systemctl disable firewalld.service
firewall-cmd --zone=public --add-port=80/tcp --permanent
```

5. 系统服务

```shell
vi /usr/lib/systemd/system/nginx.service

# 内容
[Unit]
Description=nginx - web server
After=network.target remote-fs.target nss-lookup.target
[Service]
Type=forking
PIDFile=/usr/local/nginx/logs/nginx.pid
ExecStartPre=/usr/local/nginx/sbin/nginx -t -c /usr/local/nginx/conf/nginx.conf
ExecStart=/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
ExecReload=/usr/local/nginx/sbin/nginx -s reload
ExecStop=/usr/local/nginx/sbin/nginx -s stop
ExecQuit=/usr/local/nginx/sbin/nginx -s quit
PrivateTmp=true
[Install]
WantedBy=multi-user.target


########分割

systemctl daemon-reload

systemctl start nginx.service


systemctl enable nginx.service
```



## ngnix命令

```shell
# windows启动
> start nginx

# linux/mac启动
$ service nginx start

# 手动指定配置
$ nginx -c /usr/local/nginx/conf/nginx.conf

# -p指定nginx运行目录(日志存储位置)
$ nginx -c /path/nginx.conf -p /path/

# 重启
$ nginx -s reload

# 关闭
$ nginx -s stop

# 查看端口
$ netstat -an | grep 端口  # linux/mac系统
> netstat -an | findstr 端口  # windows系统

# 测试web服务
$ curl -i 主机:端口
# 或
$ telnet 主机 端口

# 查看进程
$ ps -ef | grep nginx

# 查看错误日志
$ tail -30 /var/log/nginx/error.log
```

## 反向代理

所有的都去8080

![image-20220723090008563](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207230900636.png)

包含edu去8080

包含vod去8081

![image-20220723092210733](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207230922794.png)

## 负载均衡

```shell

# 轮询
# weight
# ip_hash(解决session共享问题)

	upstream myserver {
		server 192.168.58.100:8080;
		server 192.169.58.100:8081;
	}

    server {
        listen       80;
        server_name  192.168.58.100;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location / {
            root   html;
            index  index.html index.htm;
			proxy_pass http://myserver;
        }
```

## 动静分离

![image-20220723095342928](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207230953977.png)

## windows命令

```shell
//进入目录
start nginx

nginx -s reload

nginx -s stop

nginx -s quit
