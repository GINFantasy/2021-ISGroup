java判断网络连接是否正常

> 参考文章

[java判断网络连接是否正常](https://www.bbsmax.com/A/VGzl2R785b/)

# 背景

现需要做一个授权平台，需要有在线授权和离线授权的两种方案，所以需要进行一个网络的判断。

# 代码

```java
//ping的地址填你们服务器的地址就行了
public static boolean isConnect() {
         Runtime runtime = Runtime.getRuntime();
         try {
             Process process = runtime.exec("ping " + "www.baidu.com");
             InputStream is = process.getInputStream();
             InputStreamReader isr = new InputStreamReader(is);
             BufferedReader br = new BufferedReader(isr);
             String line = null;
             StringBuffer sb = new StringBuffer();
             while ((line = br.readLine()) != null) {
                 sb.append(line);
             }
             is.close();
             isr.close();
             br.close();
 
             if (null != sb && !sb.toString().equals("")) {
                 if (sb.toString().indexOf("TTL") > 0) {
                     //网络畅通
                     return true;
                 }
             }
         } catch (Exception e) {
             e.printStackTrace();
         }
 
         return false;
     }
```

