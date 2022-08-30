# 问题

1. 许可证存储了时间，但是离线状态下，你的时间是不准确的。如何解决过期问题。(0)
1. 跨域问题
1. mybatis查询中文,显示的sql语句,和查询字段正确,但是就是查询不出来,在url添加?useUnicode=true&characterEncoding=UTF-8.(1)
4. git切换分支.Your local changes to the following files would be overwritten by checkout:Please commit your changes or stash them before you switch branches。表示文件已经被add过，但是没有提交。
   使用git stash，保存当前工作区和暂存区进度，回退到上一个git commit之后的状态。
5. 关于正则表达式的问题，为什么，前端的正则可以使用，后台就用不了了，即使加了转义，应该也是没有问题的。(1)
6. 对于java类型中date的处理，在最开始考核之前，就知道了date的落后与繁琐，但是一直没有去了解线程安全且操作便利的localdate，这次终于能在项目中使用了。(0)
7. java使用localdatetime，mybatis无法自动转换，对于版本驱动，版本问题都已经尝试过(0)

```java
dao.DAOException: com.mysql.jdbc.MysqlDataTruncation: Data truncation: Incorrect datetime value: '\xAC\xED\x00\x05sr\x00\x1Acom.sun.jmx.snmp.Timestamp\xFC\xA2\x9Fq\xB8z\xE9!\x02\x00\x04J\x00\x06crtimeJ\x00\x09sysUpTimeL\x00\x0' for column 'date' at row 1
```

8. 关于全局自定义异常类，自定义异常无法被进行自定异常捕获器捕获，全部被最大的拦截器捕获，导致报错信息错误。

解决方法，跟踪出现异常顺序，发现在自定义异常之后会紧接着抛出其他异常，而捕获器只拦截到了最大的异常，所以一直被Exception异常捕获器捕捉。解决办法，既然一直被最大捕捉，所以可以在最大拦截器进行类型判断，再做处理。(1)

9. 邮箱正则(1)
10. 加密过程,需要进行源码加密(0)
11. 折磨人的bug,mybaits的foreach标签,使用集合后,集合为空,报错(1)
11. ssm普通类自动注入失败(1)
11. 多mac,多硬盘,多cpu(1)
11. maven打包出现无效发行版本错误(1)
11. 当升级许可证的时候,所有的授权码需要更新(0)
11. 文件加md5加密判断是否被盗用或者加了木马或者被篡改版权.;;对密文的签名进行数字证书
11. MP自动加入字段名称驼峰转换,所以实体类的字段名不是驼峰的话会导致失败读取失败，所以可以加入(1)

```xml
mybatis-plus.configuration.map-underscore-to-camel-case=false
```

18. 自定义注解加拦截器实现登录, 权限校验
19. 自定义注解进行加密,自定义注解进行日志记录
20. tcp进行通信
21. 开发者认证,通过主页url发送数据,调用接口,获取认证
22. aop防御xss
23. 两个nginx进行跳板
24. aop重复校验
25. 注意：lua+nginx里面对post拦截存在base64的拦截，以后需要传图片或者安装包时需要注意
25. redis防火墙开启
25. 知识图谱项目的泛型化

