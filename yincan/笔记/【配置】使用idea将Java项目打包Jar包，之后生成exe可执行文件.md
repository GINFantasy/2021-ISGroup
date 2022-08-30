Idea打包java项目为jar,并生成exe可执行文件

> 原文地址

[使用idea将Java项目打包Jar包，之后生成exe可执行文件](https://zhuanlan.zhihu.com/p/108521550)

# Idea打包jar包

1. 文件--项目结构![image-20220730144538370](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301445449.png)

2. 选择构件，点+号，选择jar![image-20220730144617072](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301446107.png)

3. 添加main类![image-20220730144801561](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301448614.png)

4. 点击包含项目构建，应用，确定![image-20220730144906326](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301449365.png)

5. 构建项目![image-20220730144939391](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301449420.png)

6. 现在jar文件就生成了，在out目录下![image-20220730145019246](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301450279.png)

# exe4j生成exe

1. 下载exe4j

​		[下载链接](https://exe4j.apponic.com/)

2. 安装流程只需注意选择安装地址，选择运行
3. 新建一个空文件夹，里面是你以后生成exe的地方
4. 放入刚才out中的jar包，然后把你jdk的jre文件夹复制到相同地方![image-20220730145501473](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301455501.png)

5. 打开exe4j，我们会看到这个界面![image-20220730145718022](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301457066.png)

   注册码如下,随便一个进行输入，公司名字随便填

```text
A-XVK258563F-1p4lv7mg7sav  
A-XVK209982F-1y0i3h4ywx2h1  
A-XVK267351F-dpurrhnyarva  
A-XVK204432F-1kkoilo1jy2h3r  
A-XVK246130F-1l7msieqiwqnq  
A-XVK249554F-pllh351kcke50  
A-XVK238729F-25yn13iea25i  
A-XVK222711F-134h5ta8yxbm0  
A-XVK275016F-15wjjcbn4tpj  
A-XVK275016F-15wjjcbn4tpj
```

6. 如图：![image-20220730145824218](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301458250.png)

7. 如图：![image-20220730145957867](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301459898.png)

8. 如图![image-20220730150155335](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301501381.png)

9. 如图![image-20220730150226766](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301502803.png)

![image-20220730150241908](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301502946.png)

10. 接着一直电机next,直到![image-20220730150322720](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301503761.png)

11. 点击绿色加号，路径选择文件夹中的jar包![image-20220730150404818](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301504868.png)

12. 如图![image-20220730150518221](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301505264.png)

13. 如图

![image-20220730150655101](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301506141.png)

14. 如图，选择目录中的jre文件夹![image-20220730150724451](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301507489.png)

15. 一直next，直到生成exe文件，就可以退出了，退出之前他会提示保存信息，你就可以保存配置文件后，以后直接选择，并修改相关参数就行了。![image-20220730150900310](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207301509334.png)