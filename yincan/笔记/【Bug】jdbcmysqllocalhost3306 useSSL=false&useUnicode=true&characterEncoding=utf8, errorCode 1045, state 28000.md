jdbc:mysql://localhost:3306/ ?useSSL=false&useUnicode=true&characterEncoding=utf8", errorCode 1045, state 28000

错误原因：

1. 检查用户名和密码是否输入正确
2. 是否是配置文件中username和Mysql关键字冲突,改为

```xml
jdbc.username=root
jdbc.driver=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/db_work?useUnicode=true&characterEncoding=utf8&useSSL=false
jdbc.password=root
```

[参考文章](https://blog.csdn.net/qq_38432804/article/details/104708569)

[参考文章](https://blog.csdn.net/RyanDon/article/details/82534243)