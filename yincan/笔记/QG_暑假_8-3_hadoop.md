hadoop

# Shell脚本一键启停

+ HDFS集群

```shell
start-dfs.sh
stop-dfs.sh
```

+ YARN集群

```shell
start-yarn.sh
stop-yarn.sh
```

+ Hadoop集群

```java
start-all.sh
stop-all.sh
```

+ web网页查看文件

> ip+9870

+ web查看运行程序

> ip+8088

# HDFS

## 常用操作

```shell
hadoop fs -ls file:/// # 操作本地文件系统
hadoop fs -ls hdfs://node1:8020/ # 操作HDFS分布式文件系统
hadoop fs -ls/ # 直接根目录,没有指定协议 将加载读取fs.defaultFs值


hadoop fs -appendToFile <localsrc>......<dst>
```

## MapReduce

```shell
//启动yarn集群(启动全部)
start-all.sh
//进入mr目录
cd /export/server/hadoop-3.3.0/share/hadoop/mapreduce

//运行mr程序,pi为计算的目标,2为并发度,及拆分数,10为需要的计算参数,此处为取样数
hadoop jar hadoop-mapreduce-examples-3.3.0.jar pi 2 10
```

