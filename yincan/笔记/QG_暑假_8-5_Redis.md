redis

# Redis快速入门

## 安装Redis

1. 需要先有gcc依赖

```shell
yum install -y gcc tcl
```

2. 上传安装包

[百度网盘下载地址](https://pan.baidu.com/s/1dgd3mfSOlCYs1Ivzsl3Lkg?pwd=p5zq )

比如下载到/user/local/src目录底下

3. 解压

```shell
tar -xzf redis-6.2.6.tar.gz
```

4. 进入目录

```shell
cd redis-6.2.6
```

5. 运行编译命令,这个过程需要时间，默认安装路径为/usr/local/bin

```shell
make && make install
```

## 启动Redis

### 默认启动

任意位置(前台运行，会阻塞窗口，退出请ctrl+c)

```shell
redis-server
```

### 指定配置启动

1. 进入redis的安装目录

```shell
cd /usr/local/src/redis-6.2.6
```

2. 因为需要修改配置，所以最好进行一次备份文件

```shell
cp redis.conf redis.conf.bck
```

3. 然后修改redis.conf中的一些配置

```shell
# 允许访问的地址，默认是127.0.0.1，会导致只能在本地访问。修改为0.0.0.0则可以在任意IP访问，生产环境不要设置为0.0.0.0
bind 0.0.0.0
# 守护进程，修改为yes后即可后台运行
daemonize yes 
# 密码，设置后访问Redis必须输入密码
requirepass 123456
# 日志文件，默认为空，不记录日志，可以指定日志文件名
logfile "redis.log"
```

4. 启动redis

```shell
# 当前目录下
redis-server redis.conf
```

5. 停止服务

```shell
# 利用redis-cli来执行 shutdown 命令，即可停止 Redis 服务，
# 因为之前配置了密码，因此需要通过 -u 来指定密码
redis-cli -u 123321 shutdown
```

### 开机自启

1. 新建一个系统配置文件

```shell
vi /etc/systemd/system/redis.service
```

2. 内容

```shell
[Unit]
Description=redis-server
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/redis-server /usr/local/src/redis-6.2.6/redis.conf
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

3. 重载系统服务

```shell
systemctl daemon-reload
```

4. 相关操作命令

```shell
# 启动
systemctl start redis
# 停止
systemctl stop redis
# 重启
systemctl restart redis
# 查看状态
systemctl status redis
```

5. 执行开机自启动命令

```shell
systemctl enable redis
```

## Redis客户端

### Redis命令行客户端

```shell
# 首先进入安装目录
cd /usr/local/bin


//连接ip地址
redis-cli -h 192.168.58.100 -p 6379 -a 123456
```

### 图形化桌面客户端

1. 下载,解压,运行

[百度网盘下载地址](https://pan.baidu.com/s/1YcWOuWAty54ahSbxLqQEsg?pwd=5rpx )

2. 连接redis![image-20220803213416909](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208032134067.png)

# Redis常见命令

## Redis通用命令

```re
KEYS:查看符合模板的所有key
DEL:删除一个指定的key
EXISTS:判断key是否存在
EXPIRE:给一个key 设置有效期,有效期到期时该key会自动删除
TTL:查看一个key的剩余有效期
```

## String类型常见命令

```
SET：添加或者修改已经存在的一个String类型的键值对
GET：根据key获取String类型的value
MSET：批量添加多个String类型的键值对
MGET：根据多个key获取多个String类型的value
INCR：让一个整型的key自增1
INCRBY:让一个整型的key自增并指定步长，例如：incrby num 2 让num值自增2
INCRBYFLOAT：让一个浮点类型的数字自增并指定步长
SETNX：添加一个String类型的键值对，前提是这个key不存在，否则不执行
SETEX：添加一个String类型的键值对，并且指定有效期
```

## Key结构

​		通过学习我们知道，redis中是以key-value进行存储的，我们一般都是以id作为key。但是，redis不像mysql一样，存在表，可以对每个业务进行分组，比如用户表，商品表，那么redis是如何实现的呢？

​		redis是通过固定的key格式进行区分的，有一些可以自行省略

> 项目名：业务名：类型：id

如：stopyc：user：1

​		那么 现在就分层分包了，stopyc项目下有一个表为user表，里面有key为1

## Hash类型常见命令

```
HSET key field value：添加或者修改hash类型key的field的值

HGET key field：获取一个hash类型key的field的值

HMSET：批量添加多个hash类型key的field的值

HMGET：批量获取多个hash类型key的field的值

HGETALL：获取一个hash类型的key中的所有的field和value

HKEYS：获取一个hash类型的key中的所有的field

HINCRBY:让一个hash类型key的字段值自增并指定步长

HSETNX：添加一个hash类型的key的field值，前提是这个field不存在，否则不执行
```

## LIst类型常见命令

```
LPUSH key element ... ：向列表左侧插入一个或多个元素
LPOP key：移除并返回列表左侧的第一个元素，没有则返回nil
RPUSH key element ... ：向列表右侧插入一个或多个元素
RPOP key：移除并返回列表右侧的第一个元素
LRANGE key star end：返回一段角标范围内的所有元素
BLPOP和BRPOP：与LPOP和RPOP类似，只不过在没有元素时等待指定时间，而不是直接返回nil
```

## Set类型常见命令

```
SADD key member ... ：向set中添加一个或多个元素
SREM key member ... : 移除set中的指定元素
SCARD key： 返回set中元素的个数
SISMEMBER key member：判断一个元素是否存在于set中
SMEMBERS：获取set中的所有元素
SINTER key1 key2 ... ：求key1与key2的交集
```

# Jedis客户端

## 快速入门

1. 引入依赖

```xml
<dependency>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
        <version>3.7.0</version>
</dependency>
```

2. 测试代码

```java
public class JedisTest {
    private Jedis jedis;


    /**
     * 建立连接
     */
    @BeforeEach
    void setUp() {
        //1.建立连接
        //jedis = new Jedis("192.168.58.19",6379);
        jedis = JedisConnectionFactory.getJedis();
        //2.设置密码
        jedis.auth("123456");
        //3.选择库
        jedis.select(1);
    }

    /**
     * 测试
     */
    @Test
    void testString() {
        //1.存入数据
        String set = jedis.set("name", "张三");
        System.out.println("jed = " + set);
        //2.获取数
        String name = jedis.get("name");
        System.out.println("name = " + name);
    }

    /**
     * 测试
     */
    @Test
    void testHash() {
        //1.存入数据
        Long hset = jedis.hset("stopyc:user:1", "name", "张三");
        System.out.println("hset = " + hset);
        //2.获取数据

    }

    /**
     * 释放资源
     */
    @AfterEach
    void tearDown() {
        //1.关闭连接
        if (jedis != null) {
            jedis.close();
        }
    }
}
```

## 连接池

因为jedis本身是线程不安全的，并且频繁的创建和销毁连接性能低下，所以我们使用Jedis连接池代替。

```java
public class JedisConnectionFactory {
    private static JedisPool jedisPool;

    static {
        // 配置连接池
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setMaxTotal(8);
        poolConfig.setMaxIdle(8);
        poolConfig.setMinIdle(0);
        poolConfig.setMaxWaitMillis(1000);
        // 创建连接池对象，参数：连接池配置、服务端ip、服务端端口、超时时间、密码
        jedisPool = new JedisPool(poolConfig,"192.168.58.19", 6379, 1000,"123456");
    }

    public static Jedis getJedis(){
        return jedisPool.getResource();
    }
}

```

# SpringDataRedis

## 快速入门

![image-20220806102304659](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208061023768.png)

## 代码书写

1. 创建springboot项目
2. 选择nosql下的redisdata
3. 导入依赖

```xml
   <!--        Redis依赖-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>

        <!--        连接池依赖-->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-pool2</artifactId>
        </dependency>

    </dependencies>
```

4. 书写配置信息

```yaml
spring: 
  redis:
    host: 192.168.58.25
    port: 6379
    password: 123456
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
        max-wait: 1000ms
    database: 1
    
```

4. 注入template对象

```java
@Autowired
private RedisTemplate redisTemplate;
```

5. 使用

```java
redisTemplate.opsForValue().set("name","谷歌");
Object name = redisTemplate.opsForValue().get("name");
System.out.println("name = " + name);
```

## 自定义序列化

1. 新建redisconfig

```java
@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String,Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        // 创建RedisTemplate对象
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        // 设置连接工厂
        template.setConnectionFactory(connectionFactory);
        // 创建JSON序列化工具
        GenericJackson2JsonRedisSerializer jsonRedisSerializer =
                new GenericJackson2JsonRedisSerializer();
        // 设置Key的序列化
        template.setKeySerializer(RedisSerializer.string());
        template.setHashKeySerializer(RedisSerializer.string());
        // 设置Value的序列化
        template.setValueSerializer(jsonRedisSerializer);
        template.setHashValueSerializer(jsonRedisSerializer);
        // 返回
        return template;
    }
}
```

