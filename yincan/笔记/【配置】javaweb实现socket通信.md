# javaweb实现socket通信

## 需求

​	现在需要实现一个中介软件，提供接受和发送消息的功能，与远程服务器和本地软件进行通信，实现对本地客户端的管理。

## Javaweb项目

​		通过需求我们知道，这个项目需要在web启动服务之后，同时建立socket通信服务，而这个是发生在项目启动时。因为我们javaweb项目是部署在服务器上的，比如说可以用tomcat启动一个javaweb项目，所以这个没有所谓的主方法入口，但是我们可以利用项目启动的startup方法，来解决这个问题。

​		项目采用的是ssm纯注解开发模式，摒弃了xml配置，所以使用类来注解配置。

**纯注解开发**

在Spring容器的initConfig下：

```java
public class SpringContainersInitConfig extends AbstractAnnotationConfigDispatcherServletInitializer {

    //项目启动时,新建socket通信线程
    private SocketThread socketThread;

    /**
     * 加载Spring配置类
     */
    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{SpringConfig.class};
    }

    /**
     * 加载SpringMVC配置类
     */
    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{SpringMvcConfig.class};
    }

    /**
     * 设置SpringMVC请求地址拦截规则
     */
    @Override
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }

    /**
     * 设置servlet拦截器，进行修改字符编码等操作
     */
    @Override
    protected Filter[] getServletFilters() {
        CharacterEncodingFilter filter = new CharacterEncodingFilter();
        filter.setEncoding("UTF-8");
        return new Filter[]{filter};
    }

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {

        if (null == socketThread) {
			//新建线程类
            socketThread = new SocketThread();
			//启动线程
            socketThread.start();
        }
        
        //因为重写web项目的启动方法,所以加的东西加后,得把原来的东西补上去.
        super.onStartup(servletContext);
    }
}
```

服务端代码

```java
public class SocketThread extends Thread {
    /**
     *  服务端对象
     */
    private ServerSocket serverSocket;
    /**
     * 默认监听9991端口
     */
    private int port = 9991;

    /**
     * 构造方法，初始化服务端
     */
    public SocketThread() {
        try {
            // 创建Socket服务器对象，监听9991端口
            serverSocket = new ServerSocket(port);
            System.out.println("ServerSocket创建了....");
        } catch (Exception e) {
            System.out.println("ServerSocket创建出错....");
        }

    }

    /**
     *  重写run方法
     */
    @Override
    public void run() {
        try {
            //注意点,因为这个是另起的线程,而serverSocket是主线程进行创建赋值,所以可能会导致此线程先于主线程运行,导致空指针异常
            Thread.sleep(1000);

        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("服务端启动了，等待客户端发送消息....");
        // 循环监听，直到线程中断为止
        while (!this.isInterrupted()) {
            try {
                // accept是阻塞方法，等待客户端发消息
                Socket socket = serverSocket.accept();
                if (socket != null && !socket.isClosed()) {
                    // 处理socket消息
                    handleSocket(socket);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
    * @Description: 处理服务端接收到的socket消息
    * @Param: [socket] :socket对象
    * @return: void
    * @Author: stop.yc
    * @Date: 2022/7/28
    */
    private void handleSocket(Socket socket) {
        InputStream is = null;
        InputStreamReader isr = null;
        BufferedReader br = null;
        OutputStream os = null;
        PrintWriter pw = null;
        StringBuffer result = new StringBuffer();
        try {
            is = socket.getInputStream();
            isr = new InputStreamReader(is, StandardCharsets.UTF_8);
            br = new BufferedReader(isr);

            String info = null;
            // 从流中读取客户端消息
            while ((info = br.readLine()) != null) {
                result.append(info);
            }
            // 输出消息
            System.out.println("服务端获取的客户端消息为: " + result);
            socket.shutdownInput();
            // 给客户端响应消息
            os = socket.getOutputStream();
            pw = new PrintWriter(os);
            pw.write("服务器返回给客户端的消息为:你好");

            pw.flush();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭资源
            try {
                if (pw != null) {
                    pw.close();
                }
                if (os != null) {
                    os.close();
                }
                if (br != null) {
                    br.close();
                }
                if (isr != null) {
                    isr.close();
                }
                if (is != null) {
                    is.close();
                }
                if (socket != null) {
                    socket.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 关闭socket
     */
    public void closeSocketServer() {
        try {
            if (serverSocket != null && !serverSocket.isClosed()) {
                serverSocket.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

客户端

```java
public class Client {
    // 主机地址
    private String host = "localhost";
    // 端口
    private int port = 9991;

    /**
     * 客户端向服务端发送消息
     */
    public String sendMessage(String msg) {
        // 响应结果
        StringBuffer result = new StringBuffer();
        BufferedReader br = null;
        InputStream is = null;
        OutputStream os = null;
        PrintWriter pw = null;
        Socket socket = null;
        try {
            // 和服务器创建连接
            socket = new Socket(host,port);
            System.out.println("和服务器已建立连接....");
            // 要发送给服务器的信息
            os = socket.getOutputStream();
            pw = new PrintWriter(os);
            // 给服务端发msg
            pw.write(msg);
            pw.flush();

            socket.shutdownOutput();

            // 从服务器接收的信息
            is = socket.getInputStream();
            br = new BufferedReader(new InputStreamReader(is, "gbk"));
            String info = null;
            while((info = br.readLine())!=null){
                result.append(info);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }finally {
            // 关闭流和socket
            try {
                if(br != null) {
                    br.close();
                }
                if(is != null) {
                    is.close();
                }


                if(os != null) {
                    os.close();
                }
                if(pw != null) {
                    pw.close();
                }
                if(socket != null) {
                    socket.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return result.toString();
    }
}
```

客户端发送消息

```java
public class TalkClient {
    public static void main(String args[]) throws UnknownHostException, IOException {
        String response = new Client().sendMessage("你好服务器...");
        System.out.println("服务端响应："+response);
    }
}	
```

[参考文章](https://www.panziye.com/java/3623.html)



