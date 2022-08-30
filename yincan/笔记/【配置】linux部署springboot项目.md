【配置】linux部署springboot项目

# springboot项目打包

1. 打包前，首先需要设置文件编码的格式，防止乱码的出现，需要设置都为utf-8格式

![image-20220814165217176](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208141652322.png)

2. maven-clean清除target

![image-20220814165308204](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208141653254.png)

3. maven-package打包

![image-20220814165333283](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208141653329.png)

4. 复制jar包到

![image-20220814165401115](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208141654149.png)

5. 使用xshell和xftp把jar包放到你需要部署的linux的文件目录下

![image-20220814165605624](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208141656658.png)

6. 可以对你的jar进行改名，以后的访问路径即为http://IP:端口号/项目名（如果为ROOT就不用项目名）
7. 在目录下运行代码

```shell
nohup java -jar ROOT.jar >nohup.out 2>&1 &
```

控制台信息会输出到nohup.out里

8. 查看java运行情况

```shell
# 查看进程
ps -ef | grep java

# 查看端口
netstat -ntulp |grep 8080
```

9. 杀死进程

```shell
kill -9  第8步查询出来的进程号
```

