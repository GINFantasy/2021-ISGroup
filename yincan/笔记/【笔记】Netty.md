# Netty

# Bytebuffer

## 基本使用

```java
public class TestByteBuffer {
    public static void main(String[] args) {
        //FileChannel
        //1.输入输出流
        //2.RandomAccessFIle
        try (FileChannel channel = new FileInputStream("data.txt").getChannel()) {

            //准备缓冲区
            ByteBuffer buffer = ByteBuffer.allocate(10);
            while (true) {
                //从channel 读取数据,向buffer 写入
                int len = channel.read(buffer);


                //没有内容了
                if (len == -1) {
                    break;
                }

                //打印buffer的内容
                //切换至读模式
                buffer.flip();

                while (buffer.hasRemaining()) {
                    byte b = buffer.get();
                    System.out.println((char)b);
                }

                //切换至写模式
                buffer.clear();
            }
        } catch (IOException e) {
        }
    }
}
```

## 内部结构

ByteBuffer 有以下重要属性

* capacity
* position
* limit

## 常见方法

### 分配空间

可以使用 allocate 方法为 ByteBuffer 分配空间，其它 buffer 类也有该方法

### 向buffer写入数据

+ 调用channel的read方法

```java
int readBytes = channel.read(buffer);
```

+ 调用buffer自己的put方法

```java
buf.put((byte)127);
```

### 从buffer读取数据

+ 调用channel的write方法

```java
int writeBytes = channel.write(buf);
```

+ 调用buffer自己的get方法

```java
byte b = buf.get();
```

get 方法会让 position 读指针向后走，如果想重复读取数据

* 可以调用 rewind 方法将 position 重新置为 0
* 或者调用 get(int i) 方法获取索引 i 的内容，它不会移动读指针

### mark和reset

mark 是在读取时，做一个标记，即使 position 改变，只要调用 reset 就能回到 mark 的位置

> **注意**
>
> rewind 和 flip 都会清除 mark 位置

### 字符串与ByteBuffe   r互转

```java
//字符串转为字节
ByteBuffer buffer1 = StandardCharsets.UTF_8.encode("你好");
ByteBuffer buffer2 = Charset.forName("utf-8").encode("你好");

String str = StandardCharsets.UTF_8.decode(buffer1).toString();
```

## 半包黏包解析

```java
public class TestByteBufferDemo {
    public static void main(String[] args) {
        //先手写生成一个网络半包黏包的情况
        ByteBuffer source = ByteBuffer.allocate(32);
        source.put("Hello,world\nI'm zhangsan\nHo".getBytes());

        //调用分隔方法,处理半包和黏包
        split(source);
        source.put("w are you?\nhaha!\n".getBytes());
        split(source);

    }

    private static void split(ByteBuffer buffer) {
        //首先切换到读模式
        buffer.flip();

        //读取buffer,以\n为分割符
        for (int i = 0; i < buffer.limit(); i++) {

            //当读取到换行符时
            if (buffer.get(i) == '\n') {

                //计算读取到的长度,i是当前位置,position是开始读取的位置,加1是实际长度
                int len = i + 1 - buffer.position();

                //创建缓冲区,len长度
                ByteBuffer target = ByteBuffer.allocate(len);

                //遍历原缓冲区内容,写到目标缓冲区中
                for (int i1 = 0; i1 < len; i1++) {
                    target.put(buffer.get());
                    System.out.print((char) target.get(i1));
                }
            }
        }
        //因为可能缓冲区出现半包现象,并没有以\n结尾,
        //所以里面存在一些字节没有读到目标缓冲区中,所以使用compact,把剩余内容往前移动.
        buffer.compact();
    }
}
```

# 文件编程

## 两个Channel传输数据

```java
String FROM = "helloword/data.txt";
String TO = "helloword/to.txt";
long start = System.nanoTime();
try (FileChannel from = new FileInputStream(FROM).getChannel();
     FileChannel to = new FileOutputStream(TO).getChannel();
    ) {
    from.transferTo(0, from.size(), to);
} catch (IOException e) {
    e.printStackTrace();
}
long end = System.nanoTime();
System.out.println("transferTo 用时：" + (end - start) / 1000_000.0);
```

**超过2g大小的文件传输**

```java
public class TestFileChannelTransferTo {
    public static void main(String[] args) {
        try (
                FileChannel from = new FileInputStream("data.txt").getChannel();
                FileChannel to = new FileOutputStream("to.txt").getChannel();
        ) {
            // 效率高，底层会利用操作系统的零拷贝进行优化
            long size = from.size();
            // left 变量代表还剩余多少字节
            for (long left = size; left > 0; ) {
                System.out.println("position:" + (size - left) + " left:" + left);
                left -= from.transferTo((size - left), left, to);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 遍历目录文件

```java
public class TestFilesWalkFileTree {
    public static void main(String[] args) throws IOException {

        //两个原子性计数器
        AtomicInteger dirCount = new AtomicInteger();
        AtomicInteger fileCount = new AtomicInteger();

        Files.walkFileTree(Paths.get("D:\\Download"),new SimpleFileVisitor<Path>(){
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                System.out.println("===>" + dir);
                dirCount.incrementAndGet();
                return super.preVisitDirectory(dir,attrs);
            }

            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                System.out.println(file);
                fileCount.incrementAndGet();
                return super.visitFile(file, attrs);
            }
        });

        System.out.println("dir count :" + dirCount);
        System.out.println("file count :" + fileCount);
    }
}
```

**多级删除**

```java
public class TestFilesWalkTreeDelete {
    public static void main(String[] args) throws IOException {
        Files.walkFileTree(Paths.get("路径"),new SimpleFileVisitor<Path>(){
            @Override
            public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                Files.delete(dir);
                return super.postVisitDirectory(dir, exc);
            }

            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {

                Files.delete(file);
                return super.visitFile(file, attrs);
            }
        });
    }
}
```

**拷贝多级目录**

```java
long start = System.currentTimeMillis();
String source = "D:\\Snipaste-1.16.2-x64";
String target = "D:\\Snipaste-1.16.2-x64aaa";

Files.walk(Paths.get(source)).forEach(path -> {
    try {
        String targetName = path.toString().replace(source, target);
        // 是目录
        if (Files.isDirectory(path)) {
            Files.createDirectory(Paths.get(targetName));
        }
        // 是普通文件
        else if (Files.isRegularFile(path)) {
            Files.copy(path, Paths.get(targetName));
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
});
long end = System.currentTimeMillis();
System.out.println(end - start);
```

# 网络编程

## 阻塞vs非阻塞

### 阻塞

**服务器端**

```java
public class Server {
    public static void main(String[] args) throws IOException {
        //使用nio来理解阻塞模式,单线程
        //0. bytebuffer
        ByteBuffer buffer = ByteBuffer.allocate(16);

        //1.创建了服务器
        ServerSocketChannel ssc = ServerSocketChannel.open();

        //2. 绑定监听端口
        ssc.bind(new InetSocketAddress(8080));

        //3.连接集合
        List<SocketChannel> channels = new ArrayList<>();
        while (true) {
            // 4. accept 建立与客户端连接， SocketChannel 用来与客户端之间通信
            System.out.println("connecting ...");
            SocketChannel sc = ssc.accept(); // 阻塞方法，线程停止运行
            System.out.println("connected .." + sc);
            channels.add(sc);
            for (SocketChannel channel : channels) {
                // 5. 接收客户端发送的数据
                System.out.println("before read ..." + channel);
                channel.read(buffer); // 阻塞方法，线程停止运行
                buffer.flip();
                System.out.println(buffer);
                buffer.clear();
                System.out.println("after read." + channel);
            }
        }
    }
}
```

**客户端**

```java
public class Client {
    public static void main(String[] args) throws IOException {
        SocketChannel sc = SocketChannel.open();
        sc.connect(new InetSocketAddress("localhost", 8080));
        System.out.println("waiting...");
    }
}
```

..........

# Netty

## Hello World

### 服务器端

```java
public class HelloServer {
    public static void main(String[] args) {

        //1.启动器,负责组装netty组件,启动服务器
        new ServerBootstrap()
                //2.BossEventLoop,WorkerEventLoop(selector,thread),group
                .group(new NioEventLoopGroup())
                //3.选择服务器的ServerSocketChannel 实现
                .channel(NioServerSocketChannel.class)
                //4.boss 负责处理连接worker(child)负责处理读写,决定了worker(child)能执行哪些操作(handler)
                .childHandler(
                        //5.channel 代表和客户端进行数据读写的通道 Initializer初始化，负责添加别的handler
                        new ChannelInitializer<NioSocketChannel>() {
                    protected void initChannel(NioSocketChannel ch) {
                        //6,添加具体handler
                        //将ByteBuf转换为字符串
                        ch.pipeline().addLast(new StringDecoder());
                        //自定义handler
                        ch.pipeline().addLast(new SimpleChannelInboundHandler<String>() {
                            //读事件
                            @Override
                            protected void channelRead0(ChannelHandlerContext ctx, String msg) {
                                //打印上一步转换好的字符串
                                System.out.println(msg);
                            }
                        });
                    }
                })
                //7. 绑定监听端口
                .bind(8080);
    }
}
```

### 客户端

```java
public class HelloClient {
    public static void main(String[] args) throws InterruptedException {
        //1.启动类
        new Bootstrap()
                //2.添加EventLoop
                .group(new NioEventLoopGroup())
              	//2.1可以进行区分是boss还是worker,前为boss后为worker
            	.group(new NioEventLoopGroup(),new NioEventLoopGroup(2))
                //3.选择空护短channel实现
                .channel(NioSocketChannel.class)
                //4.添加处理器
                .handler(new ChannelInitializer<Channel>() {
                    //在连接建立后被调用
                    @Override
                    protected void initChannel(Channel ch) {
                        ch.pipeline().addLast(new StringEncoder());
                    }
                })
                ///5.连接到服务器
                .connect("127.0.0.1", 8080)
                .sync()
                .channel()
                //6.向服务器发送数据
                .writeAndFlush(new Date() + ": hello world!");
    }
}
```

### 流程梳理

![image-20220721223321424](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207212233706.png)

## 组件

### EventLoop

**EventLoop**

1. 本质是一个单线程执行器（同时维护了一个selector），里面欧run方法处理channel上源源不断的事件

**EventLoopGroup**

1. 通过register进行绑定channel，后续的channel都由一个EventLoop进行绑定

```java
// 内部创建了两个 EventLoop, 每个 EventLoop 维护一个线程
EventLoopGroup group = new NioEventLoopGroup(2);//可以处理io事件,普通任务,定时任务
//EventLoopGroup group = new DefaultEventLoopGroup(2);//普通任务,定时任务
//2. 获取eventloopGroup中的下一个eventloop
System.out.println(group.next());
System.out.println(group.next());
System.out.println(group.next());


//执行普通任务,可以利用在单开一个线程进行耗时的操作
//一个不错的优化策略,可以配合CountDownLatch使用
group.next().submit(()->{
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    log.debug("ok");
});   		


//执行定时任务,0为立刻执行,1为每一秒执行一次
group.next().scheduleAtFixedRate(()->{
    log.debug("ok");
},0,1,TimeUnit.SECONDS);
```

**在服务端加上eventLoopGroup**

```java
public class EventLoopServer {
    public static void main(String[] args) {
        //细分2: 创建一个独立的EventLoopGroup
        EventLoopGroup group = new DefaultEventLoopGroup();
        new ServerBootstrap()
                //细分1:bos值负责serverSocketChannel上的accept事件,worker只负责socketChannel上的读写
                .group(new NioEventLoopGroup(),new NioEventLoopGroup(2))
                .channel(NioServerSocketChannel.class)
                .childHandler(new ChannelInitializer<NioSocketChannel>() {
                    @Override
                    protected void initChannel(NioSocketChannel ch) throws Exception {
                        ch.pipeline().addLast("handler1",new ChannelInboundHandlerAdapter() {
                            @Override
                            public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                                ByteBuf buf = (ByteBuf) msg;
                                System.out.println("buf.toString(Charset.forName(\"UTF-8\")) = " + buf.toString(StandardCharsets.UTF_8));
                                ctx.fireChannelRead(msg);
                            }
                        }).addLast(group,"handler2",new ChannelInboundHandlerAdapter(){
                            @Override
                            public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {

                                ByteBuf buf = (ByteBuf) msg;
                                System.out.println("buf.toString(StandardCharsets.UTF_8) = " + buf.toString(StandardCharsets.UTF_8));
                            }
                        });
                    }
                }).bind(8080);
    }
}
```

### channl

![](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208161534349.png)

**同异步处理结果**

```java
public class EventLoopClient {
    public static void main(String[] args) throws InterruptedException {

        //2.待有关future,promise的类型都是和异步方法配套使用,用来处理结果
        ChannelFuture channelFuture = new Bootstrap()
                .group(new NioEventLoopGroup())
                .channel(NioSocketChannel.class)
                .handler(new ChannelInitializer<NioSocketChannel>() {
                    @Override//在连接建立后被调用
                    protected void initChannel(NioSocketChannel ch) throws Exception {
                        ch.pipeline().addLast(new StringEncoder());
                    }
                })
                //1.连接到服务器
                //异步非阻塞,main发起了调用,真正执行connect是nio线程
                .connect(new InetSocketAddress("localhost", 8080));

          //2.1使用sync方法同步处理结果
//        channelFuture.sync();//阻塞住当前线程,直到nio线程连接建立完毕
//        //无阻塞向下执行获取channel,这个就是之前写授权平台出现的bug,异步线程,获取,主线程发送信息,但是一个空指针的问题
//        Channel channel = channelFuture.channel();
//
//        channel.writeAndFlush("hello,world");

            //2.2使用addListener(回调对象)方法异步处理结果
        channelFuture.addListener(new ChannelFutureListener() {
            @Override
            //在nio线程 连接建立好之后,会调用operationComplete
            public void operationComplete(ChannelFuture channelFuture) throws Exception {
                Channel channel = channelFuture.channel();
                channel.writeAndFlush("hello,world");
            }
        });
    }
}
```

**channl的优雅关闭**

```java
public class CloseFutureClient {
    public static void main(String[] args) throws InterruptedException {
        NioEventLoopGroup group = new NioEventLoopGroup();
        ChannelFuture channelFuture = new Bootstrap()
                .group(group)
                .channel(NioSocketChannel.class)
                .handler(new ChannelInitializer<NioSocketChannel>() {
                    @Override
                    protected void initChannel(NioSocketChannel channel) throws Exception {
                        channel.pipeline().addLast(new StringEncoder());
                    }
                })
                .connect(new InetSocketAddress("localhost",8080));

        Channel channel = channelFuture.sync().channel();
        new Thread(()->{
            Scanner scanner = new Scanner(System.in);
            while (true) {
                String s = scanner.nextLine();
                if ("q".equalsIgnoreCase(s)) {
                    channel.close();
                    break;
                }

            }
        },"input").start();

        //获取closedFuture对象,1) 同步处理关闭,2)异步处理关闭
        ChannelFuture closeFuture = channel.closeFuture();


        //同步
//        closeFuture.sync();
//        //
//        System.out.println("关闭channel后需要操作的事情");
//        group.shutdownGracefully();

        //异步
        closeFuture.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture channelFuture) throws Exception {
                System.out.println("关闭channel后需要操作的事情");
                group.shutdownGracefully();
            }
        });
    }
} 
```

### Future  & Promise

![image-20220816170627009](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208161706115.png)

![image-20220816170651968](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208161706082.png)

**JdkFuture**

```java
public class JdkFuture {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        //1.线程池
        ExecutorService service  = Executors.newFixedThreadPool(2);


        //2.提交任务
        Future<Integer> future = service.submit(new Callable<Integer>() {
            @Override
            public Integer call() throws Exception {

                Thread.sleep(1000);
                return 50;
            }
        });

        //3.主线程通过future来获取结果
        future.get();
    }
}
```

**NettyFuture**

```java
public class NettyFuture {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        NioEventLoopGroup group = new NioEventLoopGroup();
        EventLoop eventLoop = group.next();

        Future<Integer> future = eventLoop.submit(new Callable<Integer>() {
            @Override
            public Integer call() throws Exception {

                System.out.println("eventLoop线程");
                Thread.sleep(1000);
                return 70;
            }
        });


        //1.同步,阻塞方法
//        System.out.println("future = " + future.get());

        //2.异步,添加listener
        future.addListener(new GenericFutureListener<Future<? super Integer>>() {
            @Override
            public void operationComplete(Future<? super Integer> future) throws Exception {
                System.out.println("future.getNow() = " + future.getNow());
            }
        });
    }
}
```

**NettyPromise**

```java
public class NettyPromise {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        //1.准备EventLoop对象
        EventLoop eventLoop = new NioEventLoopGroup().next();

        //2.可以主动创建promise,结果容器
        DefaultPromise<Integer> promise = new DefaultPromise<>(eventLoop);


        new Thread(()->{

            //3.任意一个线程执行计算,计算完毕后向promise填充结果
            System.out.println("开始计算");

            try {

//                int i = 1 / 0;

                Thread.sleep(1000);

                promise.setSuccess(80);
            }catch (Exception e) {
                promise.setFailure(e);
            }
        }).start();

        //4.接受结果的线程
        System.out.println("promise.get() = " + promise.get());
    }
}
```

### Handler & pipeline

![image-20220817102755218](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208171027341.png)

**Handler**

入站执行顺序为顺序，而出站执行顺序为倒序，而且只有有写操作时，才会调用出站处理器。

![image-20220817103903575](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208171039754.png)

而当你调用ctx.write的话，是从当前的handler往前走的

### bytebuf

![image-20220817114151269](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208171141379.png)

![image-20220817114218751](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208171142878.png)

![image-20220817121614925](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208171216051.png)

![image-20220817121841629](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208171218699.png)

![image-20220817122027864](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208171220989.png)

![image-20220817122345744](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208171223868.png)

![image-20220817122453436](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208171224575.png)

![image-20220817123147241](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208171231385.png)

**谁最后调用btyrbuf,谁进行释放**

## Netty实现群聊

### 项目结构

![image-20220722163006018](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207221630077.png)

### GroupChatServerHandler

```java
package cn.stopyc.netty.groupchat;

import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.group.ChannelGroup;
import io.netty.channel.group.DefaultChannelGroup;
import io.netty.util.concurrent.GlobalEventExecutor;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GroupChatServerHandler extends SimpleChannelInboundHandler<String> {

    //public static List<Channel> channels = new ArrayList<Channel>();

    //使用一个hashmap 管理
    //public static Map<String, Channel> channels = new HashMap<String,Channel>();

    //定义一个channle 组，管理所有的channel
    //GlobalEventExecutor.INSTANCE) 是全局的事件执行器，是一个单例
    private static ChannelGroup  channelGroup = new DefaultChannelGroup(GlobalEventExecutor.INSTANCE);
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");


    //handlerAdded 表示连接建立，一旦连接，第一个被执行
    //将当前channel 加入到  channelGroup
    @Override
    public void handlerAdded(ChannelHandlerContext ctx) throws Exception {
        Channel channel = ctx.channel();
        //将该客户加入聊天的信息推送给其它在线的客户端
        /*
        该方法会将 channelGroup 中所有的channel 遍历，并发送 消息，
        我们不需要自己遍历
         */
        channelGroup.writeAndFlush("[客户端]" + channel.remoteAddress() + " 加入聊天" + sdf.format(new java.util.Date()) + " \n");
        channelGroup.add(channel);




    }

    //断开连接, 将xx客户离开信息推送给当前在线的客户
    @Override
    public void handlerRemoved(ChannelHandlerContext ctx) throws Exception {

        Channel channel = ctx.channel();
        channelGroup.writeAndFlush("[客户端]" + channel.remoteAddress() + " 离开了\n");
        System.out.println("channelGroup size" + channelGroup.size());

    }

    //表示channel 处于活动状态, 提示 xx上线
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {

        System.out.println(ctx.channel().remoteAddress() + " 上线了~");
    }

    //表示channel 处于不活动状态, 提示 xx离线了
    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {

        System.out.println(ctx.channel().remoteAddress() + " 离线了~");
    }

    //读取数据
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, String msg) throws Exception {

        //获取到当前channel
        Channel channel = ctx.channel();
        //这时我们遍历channelGroup, 根据不同的情况，回送不同的消息

        channelGroup.forEach(ch -> {
            if(channel != ch) { //不是当前的channel,转发消息
                ch.writeAndFlush("[客户]" + channel.remoteAddress() + " 发送了消息" + msg + "\n");
            }else {//回显自己发送的消息给自己
                ch.writeAndFlush("[自己]发送了消息" + msg + "\n");
            }
        });
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        //关闭通道
        ctx.close();
    }
}

```

### GroupChatServer

```java
package cn.stopyc.netty.groupchat;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.codec.string.StringEncoder;

public class GroupChatServer {

    private int port; //监听端口


    public GroupChatServer(int port) {
        this.port = port;
    }

    //编写run方法，处理客户端的请求
    public void run() throws  Exception{

        //创建两个线程组
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup(); //8个NioEventLoop

        try {
            ServerBootstrap b = new ServerBootstrap();

            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .option(ChannelOption.SO_BACKLOG, 128)
                    .childOption(ChannelOption.SO_KEEPALIVE, true)
                    .childHandler(new ChannelInitializer<SocketChannel>() {

                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {

                            //获取到pipeline
                            ChannelPipeline pipeline = ch.pipeline();
                            //向pipeline加入解码器
                            pipeline.addLast("decoder", new StringDecoder());
                            //向pipeline加入编码器
                            pipeline.addLast("encoder", new StringEncoder());
                            //加入自己的业务处理handler
                            pipeline.addLast(new GroupChatServerHandler());

                        }
                    });

            System.out.println("netty 服务器启动");
            ChannelFuture channelFuture = b.bind(port).sync();

            //监听关闭
            channelFuture.channel().closeFuture().sync();
        }finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }

    }

    public static void main(String[] args) throws Exception {

        new GroupChatServer(7000).run();
    }
}

```

### GroupChatClientHandler

```java
public class GroupChatClientHandler extends SimpleChannelInboundHandler<String> {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, String msg) throws Exception {
        System.out.println(msg.trim());
    }
}

```

### GroupChatClient

```java
public class GroupChatClient {

    //属性
    private final String host;
    private final int port;

    public GroupChatClient(String host, int port) {
        this.host = host;
        this.port = port;
    }

    public void run() throws Exception{
        EventLoopGroup group = new NioEventLoopGroup();

        try {


        Bootstrap bootstrap = new Bootstrap()
                .group(group)
                .channel(NioSocketChannel.class)
                .handler(new ChannelInitializer<SocketChannel>() {

                    @Override
                    protected void initChannel(SocketChannel ch) throws Exception {

                        //得到pipeline
                        ChannelPipeline pipeline = ch.pipeline();
                        //加入相关handler
                        pipeline.addLast("decoder", new StringDecoder());
                        pipeline.addLast("encoder", new StringEncoder());
                        //加入自定义的handler
                        pipeline.addLast(new GroupChatClientHandler());
                    }
                });

        ChannelFuture channelFuture = bootstrap.connect(host, port).sync();
        //得到channel
            Channel channel = channelFuture.channel();
            System.out.println("-------" + channel.localAddress()+ "--------");
            //客户端需要输入信息，创建一个扫描器
            Scanner scanner = new Scanner(System.in);
            while (scanner.hasNextLine()) {
                String msg = scanner.nextLine();
                //通过channel 发送到服务器端
                channel.writeAndFlush(msg + "\r\n");
            }
        }finally {
            group.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws Exception {
        new GroupChatClient("127.0.0.1", 7000).run();
    }
}
```

### pom.xml

```xml
    <dependencies>
        <dependency>
            <groupId>io.netty</groupId>
            <artifactId>netty-all</artifactId>
            <version>4.1.39.Final</version>
        </dependency>
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.8.5</version>
        </dependency>
        <dependency>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
            <version>19.0</version>
        </dependency>
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.2.3</version>
        </dependency>
        <dependency>
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>3.11.3</version>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.16.10</version>
        </dependency>

        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>1.7.28</version>
        </dependency>

    </dependencies>

```

## 心跳机制

### 项目结构

![image-20220722164348851](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207221643902.png)

```java
```

### MyServer

```java
package cn.stopyc.netty.heartbeat;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import io.netty.handler.timeout.IdleStateHandler;

import java.util.concurrent.TimeUnit;

public class MyServer {
    public static void main(String[] args) throws Exception{


        //创建两个线程组
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup(); //8个NioEventLoop
        try {

            ServerBootstrap serverBootstrap = new ServerBootstrap();

            serverBootstrap.group(bossGroup, workerGroup);
            serverBootstrap.channel(NioServerSocketChannel.class);
            serverBootstrap.handler(new LoggingHandler(LogLevel.INFO));
            serverBootstrap.childHandler(new ChannelInitializer<SocketChannel>() {

                @Override
                protected void initChannel(SocketChannel ch) throws Exception {
                    ChannelPipeline pipeline = ch.pipeline();
                    //加入一个netty 提供 IdleStateHandler
                    /*
                    说明
                    1. IdleStateHandler 是netty 提供的处理空闲状态的处理器
                    2. long readerIdleTime : 表示多长时间没有读, 就会发送一个心跳检测包检测是否连接
                    3. long writerIdleTime : 表示多长时间没有写, 就会发送一个心跳检测包检测是否连接
                    4. long allIdleTime : 表示多长时间没有读写, 就会发送一个心跳检测包检测是否连接

                    5. 文档说明
                    triggers an {@link IdleStateEvent} when a {@link Channel} has not performed
 * read, write, or both operation for a while.
 *                  6. 当 IdleStateEvent 触发后 , 就会传递给管道 的下一个handler去处理
 *                  通过调用(触发)下一个handler 的 userEventTiggered , 在该方法中去处理 IdleStateEvent(读空闲，写空闲，读写空闲)
                     */
                    pipeline.addLast(new IdleStateHandler(3,7,10, TimeUnit.SECONDS));
                    //加入一个对空闲检测进一步处理的handler(自定义)
                    pipeline.addLast(new MyServerHandler());
                }
            });

            //启动服务器
            ChannelFuture channelFuture = serverBootstrap.bind(7000).sync();
            channelFuture.channel().closeFuture().sync();

        }finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}

```

### MyServerHandler

```java
package cn.stopyc.netty.heartbeat;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.timeout.IdleStateEvent;

public class MyServerHandler extends ChannelInboundHandlerAdapter {

    /**
     *
     * @param ctx 上下文
     * @param evt 事件
     * @throws Exception
     */
    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {

        if(evt instanceof IdleStateEvent) {

            //将  evt 向下转型 IdleStateEvent
            IdleStateEvent event = (IdleStateEvent) evt;
            String eventType = null;
            switch (event.state()) {
                case READER_IDLE:
                  eventType = "读空闲";
                  break;
                case WRITER_IDLE:
                    eventType = "写空闲";
                    break;
                case ALL_IDLE:
                    eventType = "读写空闲";
                    break;
            }
            System.out.println(ctx.channel().remoteAddress() + "--超时时间--" + eventType);
            System.out.println("服务器做相应处理..");

            //如果发生空闲，我们关闭通道
            ctx.channel().close();
        }
    }
}

```

