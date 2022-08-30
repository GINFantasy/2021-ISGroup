服务器安装openresty实现WAF防火墙

> 原文链接

[Centos7安装openresty实现WAF防火墙功能](https://cloud.tencent.com/developer/article/2012946)

# 安装openresty

## yum安装依赖库

```shell
yum install -y pcre-devel openssl-devel gcc postgresql-devel
```

## 下载源码包并且安装

```shell
# 第一步,新建一个文件夹,如果命名不行就手动创建
mkdir /data/software
cd  /data/software
# 下载
wget https://openresty.org/download/openresty-1.19.9.1.tar.gz
#解压
tar -zxvf openresty-1.19.9.1.tar.gz
cd openresty-1.19.9.1/

./configure --prefix=/usr/local/openresty \
            --with-luajit \
            --without-http_redis2_module \
            --with-http_iconv_module \
            --with-http_postgres_module
            
gmake && gmake install

# 启动
/usr/local/openresty/nginx/sbin/nginx

# 打开浏览器,访问你服务器的ip地址 http://IP,出现如下表示安装成功了
```

![image-20220812094725709](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208120947837.png)



### 常用命令

```shell
# 命令和nginx的命令一模一样,只不过路径不同罢了
# 启动
/usr/local/openresty/nginx/sbin/nginx

# 或者指定配置文件启动
/usr/local/openresty/nginx/sbin/nginx -c /usr/local/openresty/nginx/conf/nginx.conf -p /usr/local/openresty/nginx/

# 停止
/usr/local/openresty/nginx/sbin/nginx -s stop

# 启动
/usr/local/openresty/nginx/sbin/nginx

# 重置
/usr/local/openresty/nginx/sbin/nginx -s reload
```

## 验证是否lua成功安装

```shell
vim /usr/local/openresty/nginx/conf/nginx.conf

# 在http块下的server块中添加：
location /hello {
                default_type 'text/plain';
                content_by_lua 'ngx.say("hello,lua")';
        }
 
/usr/local/openresty/nginx/sbin/nginx -s reload

# 浏览器输入这个.出现hello,lua即为成功
http://IP:80/hello
```

![image-20220812095702697](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208120957732.png)

## 配置环境变量

```shell
echo '# 配置OpenResty环境变量' >> /etc/profile
echo 'export OPENRESTY_HOME=/usr/local/openresty/' >> /etc/profile
echo 'export PATH=${OPENRESTY_HOME}/bin:$PATH' >> /etc/profile
echo 'PATH=/usr/local/openresty/nginx/sbin:$PATH' >> /etc/profile
echo 'export PATH' >> /etc/profile

# 生效：
source  /etc/profile

echo $OPENRESTY_HOME

openresty -s reload
nginx -V
nginx -t

# 输入下面语句 
openresty -help

# 出现下面的内容即为环境配置成功
nginx version: openresty/1.19.9.1
Usage: nginx [-?hvVtTq] [-s signal] [-p prefix]
             [-e filename] [-c filename] [-g directives]

Options:
  -?,-h         : this help
  -v            : show version and exit
  -V            : show version and configure options then exit
  -t            : test configuration and exit
  -T            : test configuration, dump it and exit
  -q            : suppress non-error messages during configuration testing
  -s signal     : send signal to a master process: stop, quit, reopen, reload
  -p prefix     : set prefix path (default: /usr/local/openresty/nginx/)
  -e filename   : set error log file (default: logs/error.log)
  -c filename   : set configuration file (default: conf/nginx.conf)
  -g directives : set global directives out of configuration file
```

## 安装并且配置WAF

```shell
# clone仓库,如果没有安装git环境
# yum -y install git,然后再运行clone
git clone https://github.com/unixhot/waf.git

# 进行仓库复制
cp -r ./waf/waf /usr/local/openresty/nginx/conf/

# 修改配置
vim /usr/local/openresty/nginx/conf/nginx.conf

# 在http{}中增加，注意路径，同时WAF日志默认存放在/tmp/日期_waf.log
lua_shared_dict limit 50m;
lua_package_path "/usr/local/openresty/nginx/conf/waf/?.lua";
init_by_lua_file "/usr/local/openresty/nginx/conf/waf/init.lua";
access_by_lua_file "/usr/local/openresty/nginx/conf/waf/access.lua";
```

![image-20220812100246598](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208121002641.png)

```shell
# 连接
ln -s /usr/local/openresty/lualib/resty/ /usr/local/openresty/nginx/conf/waf/resty
# 配置检查,必须出现ok和successful,不行就得回头检查你的nginx配置文件哪里出错了
/usr/local/openresty/nginx/sbin/nginx -t
# 配置成功即重新加载
/usr/local/openresty/nginx/sbin/nginx -s reload

# 保存退出并重启
openresty -t && openresty -s reload

# 那么waf防火墙就配置好了
# 接下来我们先来尝试几个例子吧
# 浏览器输入你的服务器ip地址,他会出现刚才的welcome界面,接下来,你只要疯狂刷新页面,就会出现下面的页面
# 接着我们尝试一些非法的请求路径http://你的ip地址/.svn/,就会出现第二张图片的内容
```

![image-20220812101005115](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208121010143.png)

![image-20220812101129024](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208121011064.png)

## 尝试配置WAF

```shell
# 查看一些里面的配置
cat /usr/local/openresty/nginx/conf/waf/config.lua

config_waf_enable = "on" --是否启用waf模块，值为 on 或 off
config_log_dir = "/tmp" --waf的日志位置，日志格式默认为json
config_rule_dir = "/usr/local/openresty/nginx/conf/waf/rule-config" --策略规则目录位置，可根据情况变动
config_white_url_check = "on" --是否开启URL检测
config_white_ip_check = "on" --是否开启IP白名单检测
config_black_ip_check = "on" --是否开启IP黑名单检测
config_url_check = "on" --是否开启URL过滤
config_url_args_check = "on" --是否开启Get参数过滤
config_user_agent_check = "on" --是否开启UserAgent客户端过滤
config_cookie_check = "on" --是否开启cookie过滤
config_cc_check = "on" --是否开启cc攻击过滤
config_cc_rate = "10/60" --cc攻击的速率/时间，单位为秒；默认示例中为单个IP地址在60秒内访问同一个页面次数超过10次则认为是cc攻击，则自动禁止此IP地址访问此页面60秒，60秒后解封(封禁过程中此IP地址依然可以访问其它页面，如果同一个页面访问次数超过10次依然会被禁止)
config_post_check = "on" --是否开启POST检测
config_waf_output = "html" --对于违反规则的请求则跳转到一个自定义html页面还是指定页面，值为 html 和 redirect
config_waf_redirect_url = "https://www.unixhot.com" --指定违反请求后跳转的指定html页面
--指定违反规则后跳转的自定义html页面
config_output_html=[[
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Language" content="zh-cn" />
<title>网站防火墙</title>
</head>
<body>
<h1 align="center"> 欢迎白帽子进行授权安全测试，安全漏洞请联系QQ：1111111。
</body>
</html>
]]
```

**注: 以下配置生效都需要在上面的配置文件中打开on** 

### **IP黑名单配置**

```shell
# 编辑配置文件,里面输入需要屏蔽的ip地址
vim /usr/local/openresty/nginx/conf/waf/rule-config/blackip.rule
```

### **IP白名单配置**

```shell
vim /usr/local/openresty/nginx/conf/waf/rule-config/whiteip.rule
```

### **CC攻击过滤**

```shell
# 这个直接在config.lua配置
```

### 异常url

```shell
vim /usr/local/openresty/nginx/conf/waf/url.rule
# 直接把不想别人访问的路径添加进去,例如
/admin
```

### **异常UserAgent策略配置**

```shell
vim /usr/local/openresty/nginx/conf/waf/useragent.rule
```

### **异常Get参数策略配置**

```shell
vim /usr/local/openresty/nginx/conf/waf/args.rule
```

### **异常POST参数策略配置**

```shell
vim /usr/local/openresty/nginx/conf/waf/post.rule
```

















