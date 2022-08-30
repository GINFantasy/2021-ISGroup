java运行cmd命令

# 背景

目前正在做一个授权的系统，所以我们需要获取用户的硬件指纹信息，所以就日常进网上找答案，java如何获取mac地址，如何获取cpu序列号等等。一开始项目的运行效果还是不错的，当把项目部署后，就出现问题了，一个用户，mac地址不止一个，硬盘序列号不止一个，而网上的大多数方法又只能获取到第一个信息，所以不符合实际。

# 思路

我们用户要获取我们的硬件指纹信息，大可以通过cmd命令进行获取，那我们转变思路，既然不能通过直接api获取硬件指纹信息，那我们能不能直接调用cmd进行获取

# 代码

```java
//返回cmd命令查询出来的所有信息
public static String getHardInfo(String commandStr) throws IOException {
        BufferedReader br = null;
        try {
            Process p = Runtime.getRuntime().exec(commandStr);
            br = new BufferedReader(new InputStreamReader(p.getInputStream(), Charset.forName("GBK")));
            String line = null;
            StringBuilder sb = new StringBuilder();
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
	}
```

# 附

```shell
1.获取硬盘序列号
wmic diskdrive get serialnumber
2.获取cpu序列号
wmic CPU get ProcessorID
3.获取计算机ip,网卡的信息
ipconfig -all
```

