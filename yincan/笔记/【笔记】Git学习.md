

# Git本地连接远程仓库

1. 初始化远程仓库(复制连接)
   <img src="https://cdn.jsdelivr.net/gh/stopyc/picb@main/202205041141443.png" alt="image-20220404223022520" style="zoom:50%;" />

2. 本地新建文件夹,以后你的代码就是丢在里面了.

3. 右击鼠标,选择 Git bash 
   <img src="https://cdn.jsdelivr.net/gh/stopyc/picb@main/202205041142217.png" alt="image-20220404224232013" style="zoom: 50%;" />

   

4. git init //初始化仓库
   <img src="https://cdn.jsdelivr.net/gh/stopyc/picb@main/202205041142995.png" alt="image-20220404224423342" style="zoom: 50%;" />

2. touch 文件名.txt //新建一个测试文件,测试提交和连接是否成功
   <img src="https://cdn.jsdelivr.net/gh/stopyc/picb@main/202205041142864.png" alt="image-20220404224508371" style="zoom:50%;" />
3. vi 文件名.txt  //进入txt文件,按insert进入编辑内容,编辑完成后,按esc退出编辑,
   <img src="https://cdn.jsdelivr.net/gh/stopyc/picb@main/202205041142761.png" alt="image-20220404224553095" style="zoom:50%;" />
4. :wq   //保存并退出
5. git remote add origin https://gitee.........(你的远程仓库的连接)    //连接仓库<img src="https://cdn.jsdelivr.net/gh/stopyc/picb@main/202205041142276.png" alt="image-20220404224914235" style="zoom:50%;" />
6. git pull origin master   //拉取远程仓库内容
   <img src="https://cdn.jsdelivr.net/gh/stopyc/picb@main/202205041142248.png" alt="image-20220404225035766" style="zoom:50%;" />
7. git add . //将本地所有文件添加到仓库
8. git commit -m"注释"    ///进行提交注释
9. git push origin master //推送到远程仓库,本地与远程连接成功~
   <img src="https://cdn.jsdelivr.net/gh/stopyc/picb@main/202205041142691.png" alt="image-20220404225154080" style="zoom:50%;" />

10-12的步骤是你以后把代码更新后,推送到远程的通用操作,add后面可以只跟某一个文件



