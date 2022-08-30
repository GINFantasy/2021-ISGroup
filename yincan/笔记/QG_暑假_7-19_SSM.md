# Spring

注:如果想跳过从Xml直接从Spring整合MyBatis开始,SSM整合则在SpringMVC中的SSM整合

## IOC/DI注解开发

1. 创建Maven项目
2. pom.xml添加Spring的依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>5.2.10.RELEASE</version>
    </dependency>
</dependencies>
```



3. resources下添加applicationContext.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
            http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <context:component-scan base-package="cn.stopyc"/>
</beans>
```

4. 添加service和dao层代码

```java
public interface BookService {

    /**
     * 保留书本信息
     */
    void save();
}

@Service
public class BookServiceImpl implements BookService {

    /**
    * @Description: hao
    * @Param: []
    * @return: void
    * @Author: stop.yc
    * @Date: 2022/7/17
    */
    public void save() {
        System.out.println("保留书本");
    }
}


public interface BookDao {

    void save();
}


@Repository("bookDao")
public class BookDaoImpl implements BookDao{
    public void save() {
        System.out.println("save");
    }
}

```

5. 创建运行类

```java
public class App2 {
    public static void main(String[] args) {
        //3.获取Ioc容器
        ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");

        //4.获取bean
        BookDao bookDao = (BookDao) ctx.getBean("bookDao");
//        BookService bookService = (BookService) ctx.getBean("bookService");
        BookService bookService = (BookService) ctx.getBean(BookService.class);

        bookDao.save();
        bookService.save();
    }
}
```

## 纯注解开发模式

![image-20220717143013358](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207171430403.png)

1. 注解类

```java
@Configuration
@ComponentScan("cn.stopyc")
public class SpringConfig {
}
```

2. 启动类

```java
public class App2 {
    public static void main(String[] args) {

        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(SpringConfig.class);


        //4.获取bean
        BookDao bookDao = (BookDao) ctx.getBean("bookDao");
//        BookService bookService = (BookService) ctx.getBean("bookService");
        BookService bookService = (BookService) ctx.getBean(BookService.class);


        bookDao.save();
        bookService.save();

    }
}
```

## bean作用范围与生命周期管理

```java
@Repository
@Scope("prototype")//非单例
public class BookDaoImpl implements BookDao {

    public void save() {
        System.out.println(1111);
    }

    //初始
    @PostConstruct
    public void init () {
        System.out.println("init");
    }

   // 销毁
    @PreDestroy
    public void destroy() {
        System.out.println("destroy");
    }
}
```

## 依赖注入

### 按照类型注入

```java
@Service
public class BookServiceImpl implements BookService {
    @Autowired
    private BookDao bookDao;

    /**
    * @Description: hao
    * @Param: []
    * @return: void
    * @Author: stop.yc
    * @Date: 2022/7/17
    */
    public void save() {
        bookDao.save();
        System.out.println("保留书本");
    }
}
```

### 按照名称注入

当出现多个相同类型的bean,可以采用按照名称注入

```java
@Autowired
@Qualifier(名称)
```

### 简单类型注入

```java
@Repository
@Scope("singleton")
public class BookDaoImpl implements BookDao {

//    @Value("stopyc") 直接指定内容
    @Value("${name}")//读取配置文件
    private String name;

    public void save() {
        System.out.println(1111 + name);
    }

    @PostConstruct
    public void init () {
        System.out.println("init");
    }

    @PreDestroy
    public void destroy() {
        System.out.println("destroy");
    }
}
```

配置文件设置

```java
@Configuration
@ComponentScan("cn.stopyc")
@PropertySource("jdbc.properties")
public class SpringConfig {
}
```

![image-20220717150138709](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207171501757.png)

```java
#文件内容
name=stopyc
```

## 开发管理第三方Bean

1. 写第三方配置文件

```java
public class JdbcConfig {

    //添加简单数据类型,如何配置请看上面介绍

    @Value("${driver}")
    private String driver;
    @Value("${url}")
    private String url;
    @Value("${username}")
    private String username;
    @Value("${password}")
    private String password;


    //1.定义一个方法获得要管理的对象
    //2.添加@Bean,表示当前方法的返回值是一个bean

    //3.添加引用类型,只要引用类型是被加载到容器当中,直接加入形参即可
    @Bean
    public DataSource dataSource (BookDao bookDao) {
        DruidDataSource ds = new DruidDataSource();
        ds.setDriverClassName(driver);
        ds.setUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);
        return ds;
    }
}
```

2. 导入到Spring的配置文件中

```java
@Configuration
@ComponentScan("cn.stopyc")
@PropertySource("jdbc.properties")
@Import(JdbcConfig.class)
public class SpringConfig {
}
```

3. 主启动类获取Bean对象

```java
public class App {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(SpringConfig.class);
        BookDao bookDao = ctx.getBean(BookDao.class);
        DataSource dataSource = ctx.getBean(DataSource.class);
        System.out.println(dataSource);
    }
}
```

# MyBatis

## 项目结构

![image-20220718113453912](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207181134959.png)

## Maven导入依赖

```xml
<dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.2.3</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.5</version>
        </dependency>
    </dependencies>
```

## mybatis-config.xml配置文件

记住,mybatis配置文件名称不要修改,然后内容中的路径,自行查看自己的项目包路径进行修改

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>

<!--    设置mybatis打印信息-->
    <settings>
        <setting name="logImpl" value="STDOUT_LOGGING" />
    </settings>

<!--    设置别名,自动检测包下的实体类-->
    <typeAliases>
        <package name="cn.stopyc.po"/>
    </typeAliases>

    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/db_work?userSSL=false&amp;useUnicode=true&amp;characterEncoding=utf8"/>
                <property name="username" value="root"/>
                <property name="password" value="123456"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
<!--        加载sql映射文件,弃用-->
<!--        <mapper resource="cn\stopyc\mapper\UserMapper.xml"/>-->

<!--        使用Mapper代理-->
        <package name="cn.stopyc.mapper"/>
    </mappers>
</configuration>
```

## 实体类的映射文件--UserMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">


<mapper namespace="cn.stopyc.mapper.UserMapper">

    <!--    结果映射,因为数据库中字段命名(下划线)和java驼峰命名不一致-->

    <!--    resultMap:-->
    <!--    1. 定义<resultMap>标签-->
    <!--    2.在<select>b标签中,使用resultMap属性替换resultType标签</select>-->
    <resultMap id="userResultMap" type="user">
        <result column="userName" property="userName"/>
        <!--        实际开发中,因为之前表的设计不严谨,实体类和数据库字段命名一样.前为数据库,后为实体类属性-->
        <!--        <result column="company_name" property="companyName"/>-->
    </resultMap>


    <!--    使用了别名映射,记得替换resultType,id即为java方法中的名称-->
    <select id="selectAll" resultMap="userResultMap">
     select * from t_user;
  </select>


    <!--    参数占位符:-->
    <!--    1. #{}:会将其替换为?,为了防止sql注入-->
    <!--    2. ${}:直接拼接字符串,会产生sql注入问题-->
    <!--    3. 使用时机:-->
    <!--        + 参数传递的时候:#{}-->
    <!--        + 表名或者列名不固定的情况下:${} 会存在sql注入问题

            * 参数类型:parameterType:可以省略
            * 特殊字符处理:
                1.转义字符:可以上网搜索xml转义字符
                2.CDATA区:idea输入CD提示,在里面输入特殊字符
            -->
    <select id="selectById" resultMap="userResultMap">
        select * from t_user where userId = #{userId} ;
    </select>

    <!--    固定条件查询-->
    <!--    <select id="selectByCondition" resultMap="userResultMap">-->
    <!--        select * from t_user where userName=#{userName}-->
    <!--        and position=#{position}-->
    <!--        and gender=#{gender};-->
    <!--    </select>-->
    <!--    -->

    <!--    动态sql查询,使用where和if标签,test即为拼接条件-->
    <select id="selectByCondition" resultMap="userResultMap">
        select * from t_user

        <where>
            <if test="userName != null and userName != ''">
                and userName=#{userName}
            </if>

            <if test="position != null">
                and position=#{position}
            </if>

            <if test="gender != null">
                and gender=#{gender};
            </if>
        </where>
    </select>


    <!--    动态单条件查询,使用choose标签,类似switch,when即为case,记得最后一个otherwise,即为default-->
    <select id="selectBySingleCondition" resultMap="userResultMap">
        select * from t_user
        <where>
            <choose>
                <when test="userName != null and userName != ''">
                    userName=#{userName}
                </when>
                <when test="position != null">
                    position=#{position}
                </when>
                <when test="gender != null">
                    gender=#{gender};
                </when>
                <otherwise>
                    1=1
                </otherwise>
            </choose>
        </where>
    </select>

    <!--    添加数据-->
    <!--    <insert id="add">-->
    <!--        insert into t_user(userName,position ) values (#{userName},#{position});-->
    <!--    </insert>-->


    <!--    主键返回,即添加了数据后,有时候需要获得新增行的id,便可以设置主键返回,在java方法中添加后,直接getId.-->
    <insert id="add" useGeneratedKeys="true" keyProperty="userId">
        insert into t_user(userName,position ) values (#{userName},#{position});
    </insert>


    <!--    修改固定字段信息-->
    <!--    <update id="update">-->
    <!--        update t_user-->
    <!--        set-->
    <!--            userName = #{userName},-->
    <!--            position = #{position},-->
    <!--            gender = #{gender}-->

    <!--        where userId = #{userId}-->
    <!--    </update>-->


    <!--    动态修改字段信息,使用set和if标签-->
    <update id="update">
        update t_user
        <set>
            <if test="userName != null and userName != ''">
                userName = #{userName},
            </if>

            <if test="position != null and position != ''">
                position = #{position},
            </if>

            <if test="gender != null and gender != ''">
                gender = #{gender},
            </if>
        </set>
        where userId=#{userId}
    </update>


    <!--    单个删除-->
    <delete id="delByUserId">
        delete from t_user where userId = #{userId}
    </delete>

    <!--    mybatis会将数组参数,封装为一个map集合,-->
    <!--    默认:array = 数组-->
    <!--    使用@Param注解改变为map集合的默认key的名称-->
    <!--    separator即为分隔符,下为where id in (1,2,3,34,5)中的逗号-->
    <delete id="deleteByUserIds">
        delete from t_user where userId
        in (
        <foreach collection="ids" item="userId" separator=",">
            #{userId}
        </foreach>
        );
    </delete>

</mapper>
```

## 映射的方法--UserMapper

```java
package cn.stopyc.mapper;

import cn.stopyc.po.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * @program: spring_01_quickstart
 * @description:
 * @author: stop.yc
 * @create: 2022-07-17 16:16
 **/
public interface UserMapper {

    /**
     * 查询所有
     * @return:返回用户集合
     */
    List<User> selectAll();

    /**
     * 根据id查询用户
     * @param userId:用户id
     * @return :返回一个用户对象
     */
    User selectById(int userId);


    /**
     * 固定的条件查询
     *      参数接受
     *          1. 散装参数:如果方法中有多个参数,需要使用@Param("Sql参数占位符名称")
     *          2. 对象参数
     *          3. map集合参数
     */

    /**
     * 散装参数,记得设置名称,此名称为数据库中字段名称,非java中实体类的名称
     * @param userName
     * @param position
     * @param gender
     * @return :返回一个用户对象
     */
//    User selectByCondition(@Param("userName") String userName, @Param("position") int position,@Param("gender") int gender);

    /**
     * 对象参数
     * @param user:传入一个封装了查询条件的对象
     * @return :返回一个用户对象
     */
//    User selectByCondition(User user);

    /**
     * ,map集合参数
     * @param map: 键值对封装查询数据
     * @return :返回一个用户对象
     */
    User selectByCondition(Map map);


    /**
     * 单条件 动态 查询
     * @param user :封装了不定的查询条件
     * @return :返回一个用户集合
     */
     List<User> selectBySingleCondition(User user);


    /**
     * 新增用户
     * @param user :封装了新增信息
     */
     void add(User user);


    /**
     * 更新用户信息
     * @param user :动态封装信息
     * @return :修改行数
     */
     int update(User user) ;


    /**
     * 单个删除,
     * @param userId:被删除的id
     * @return :被删除的对象
     */
     User delByUserId(int userId);


    /**
     * 使用注解进行简单sql开发
     * @param userId :删除用户的id
     * @return :被删除的用户对象
     */
     @Select("select *from t_user where userId = #{userId}")
     User  selectByUserId(int userId);


    /**
     * 批量删除
     * @param ids :被删除的用户id集合
     */
     void deleteByUserIds(@Param("ids") int[] ids);
}

```

## 主方法

```java
package cn.stopyc.test;

import cn.stopyc.mapper.UserMapper;
import cn.stopyc.po.User;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.junit.Test;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * @program: spring_01_quickstart
 * @description:
 * @author: stop.yc
 * @create: 2022-07-17 16:39
 **/
public class MyBatisTest {

    @Test
    public void testSelectAll() throws IOException {


        //建立需要操作的id
        int id = 2;

        //1.加载mybatis的核心配置文件,获取SqlSessionFactory(可以在mybatis官网查看)
        //resource中的字符串即为上面强调的mybatis配置名称尽量一样.
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);

        //2.获取SqlSession对象,用它来执行sql
        SqlSession sqlSession = sqlSessionFactory.openSession();

        //3.通过sqlSession获取mapper对象,通过mapper字节码获取
        UserMapper userMapper = sqlSession.getMapper(UserMapper.class);

        //4.执行查询方法,固定字段信息
//        List<User> users = userMapper.selectAll();
//        User user = userMapper.selectById(id);

        //4.1散装参数
//        User user1 = userMapper.selectByCondition("张三", 1, 1);
//        System.out.println(user1);


        //4.2 对象封装
//        User user = new User();
//        user.setUserName("张三");
//        user.setPosition(1);
//        user.setGender("1");
//        User user1 = userMapper.selectByCondition(user);
//        System.out.println(user1);

        //Map集合
//        HashMap hashMap = new HashMap();
//        hashMap.put("userName","张三");
//        hashMap.put("gender","1");
//        hashMap.put("position",1);
//        User user1 = userMapper.selectByCondition(hashMap);
//        System.out.println(user1);

        //动态单条件查询,即可以增删查询条件,自动拼接sql语句
        User user = new User();
        user.setUserName("999");
//        user.setPosition(1);
        user.setUserId(4);
//        user.setGender("1");
        List<User> user1 = userMapper.selectBySingleCondition(user);
        System.out.println(user1);

        //添加
//        userMapper.add(user);

        //修改,已经使用了动态sql进行修改
//        userMapper.update(user);

        //单个删除
//        userMapper.delByUserId(7);

        //批量删除
        int[] ids = {3, 4};
        userMapper.deleteByUserIds(ids);

        //进行操作时,需要提交事务,下面这一句
        sqlSession.commit();
        //或者把获取sqlSession 那个参数设置为true,即为自动提交

        //5.释放资源
        sqlSession.close();
    }
}
```

# Spring整合MyBatis

## 创建Maven项目

## 项目结构

![image-20220718163827157](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207181638202.png)

## 导入依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>spring_16_spring_mybatis</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>5.2.10.RELEASE</version>
        </dependency>

        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.2.3</version>
        </dependency>

        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.5</version>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>5.1.34</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>5.2.10.RELEASE</version>
        </dependency>

        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>1.3.0</version>
        </dependency>
        
    </dependencies>

</project>
```

## resources配置文件

注:代码中出现的路径皆是我自己项目中的路径,请根据实际情况进行更改(会单列一行出来)

### applicationContext.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">
    <!--单独设置-->
    <context:component-scan base-package="cn.stopyc"/>
    
</beans>
```

### jdbc.properties

```properties
jdbc.username=root
jdbc.driver=com.mysql.jdbc.Driver
# 单独设置
jdbc.url=jdbc:mysql://localhost:3306/数据库名称?useUnicode=true&characterEncoding=utf8&useSSL=false

jdbc.password=root
```

## config配置类

### JdbcConfig

```java
package cn.stopyc.config;

import com.alibaba.druid.pool.DruidDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;


/**
 * @program: spring_01_quickstart
 * @description:
 * @author: stop.yc
 * @create: 2022-07-18 15:00
 **/
public class JdbcConfig {
   
	//读取配置文件的内容
    @Value("${jdbc.driver}")
    private String driver;
    @Value("${jdbc.url}")
    private String url;
    @Value("${jdbc.username}")
    private String username;
    @Value("${jdbc.password}")
    private String password;


    //1.定义一个方法获得要管理的对象
    //2.添加@Bean,表示当前方法的返回值是一个bean
    @Bean
    public DataSource dataSource () {
        DruidDataSource ds = new DruidDataSource();
        ds.setDriverClassName(driver);
        ds.setUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);
        return ds;
    }
}

```

### MybatisConfig

```java
package cn.stopyc.config;

import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.mapper.MapperScannerConfigurer;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;

/**
 * @program: spring_01_quickstart
 * @description:
 * @author: stop.yc
 * @create: 2022-07-18 15:12
 **/
public class MybatisConfig {

    @Bean
    public SqlSessionFactoryBean sqlSessionFactory(DataSource dataSource){

        SqlSessionFactoryBean ssfb = new SqlSessionFactoryBean();

        //设置实体类的别名扫描(需要单独设置)
        ssfb.setTypeAliasesPackage("cn.stopyc.po");

        //设置数据源
        ssfb.setDataSource(dataSource);

        return ssfb;
    }


    //定义bean，返回MapperScannerConfigurer对象
    @Bean
    public MapperScannerConfigurer mapperScannerConfigurer(){
        MapperScannerConfigurer msc = new MapperScannerConfigurer();
        
        //设置需要映射的路径(单独设置)
        msc.setBasePackage("cn.stopyc.dao");
        
        return msc;
    }
}

```

### SpringConfig

```java
package cn.stopyc.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.PropertySource;

/**
 * @program: spring_01_quickstart
 * @description:
 * @author: stop.yc
 * @create: 2022-07-18 14:57
 **/
@Configuration
//需要扫描的包路径(单独设置)
@ComponentScan("cn.stopyc")
@PropertySource("classpath:jdbc.properties")
@Import({JdbcConfig.class,MybatisConfig.class})
public class SpringConfig {
}

```

## dao层代码

### UserMapper

```java
package cn.stopyc.dao;

import cn.stopyc.po.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * @program: spring_01_quickstart
 * @description:
 * @author: stop.yc
 * @create: 2022-07-17 16:16
 **/
public interface UserMapper {

    /**
     * 查询所有
     * @return:返回用户集合
     */
    @Select("select * from t_user")
    List<User> selectAll();
}

```

## po

### User

```java
//根据自己的数据库表进行创建.
```

## service

### UserService

```java
public interface UserService {
    List<User> selectAll();
}
```

### impl--UserServiceImpl

```java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    //如果userMapper爆红那就在UserMapper那里加上注解,@Mapper和@Repository
    private  UserMapper userMapper;

    @Override
    public List<User> selectAll(){
        return userMapper.selectAll();
    }
}
```

## App2

```java
public class App2 {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(SpringConfig.class);

        UserService userService = ctx.getBean(UserService.class);

        List<User> users = userService.selectAll();

        System.out.println(users);
    }
}   
```

# Spring整合Junit

## pom.xml

```xml
<dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
            <version>5.2.10.RELEASE</version>
        </dependency>


<!--这个之前加过了-->
<dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>
```

## 项目结构

![image-20220718172126389](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207181721441.png)

## UserServiceTest

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SpringConfig.class)
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    public void testSelectAll() {
        System.out.println(userService.selectAll());
    }
}
```

# AOP入门案例

## 导入依赖

```xml
 <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjweaver</artifactId>
            <version>1.9.4</version>
        </dependency>
```

## 项目结构

![image-20220718200740047](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207182007106.png)

## MyAdvice

```java
@Component
@Aspect
public class  MyAdvice {

    @Pointcut("execution(void cn.stopyc.dao.UserMapper.update())")
    private  void pt(){

    }
    @Before("pt()")
    public void method(){
        System.out.println(System.currentTimeMillis());
    }
}
```

## SpringConfig

```java
@Configuration
@ComponentScan("cn.stopyc")
@PropertySource("classpath:jdbc.properties")
@Import({JdbcConfig.class,MybatisConfig.class})
@EnableAspectJAutoProxy
public class SpringConfig {

}
```

## 主启动类

```java
public class App3 {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(SpringConfig.class);

        UserService userService = ctx.getBean(UserService.class);

        userService.update();
    }
}
```

## AOP切入点表达式

![image-20220718202224817](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207182022894.png)

![image-20220718202243873](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207182022939.png)

## AOP通知类型

```java
@Component
@Aspect
public class MyAdvice {
    @Pointcut("execution(void com.itheima.dao.BookDao.update())")
    private void pt(){}
    
    //有返回值的切入点
    @Pointcut("execution(int com.itheima.dao.BookDao.select())")
    private void pt2(){}
    
    @Around("pt2()")
    public Object aroundSelect(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("around before advice ...");
        //表示对原始操作的调用,ret接返回值,
        Object ret = pjp.proceed();
        System.out.println("around after advice ...");
        return ret;
    }
}
```

## AOP业务层接口执行效率

```java
package cn.stopyc.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * @program: spring_01_quickstart
 * @description:
 * @author: stop.yc
 * @create: 2022-07-18 19:56
 **/
@Component
@Aspect
public class  MyAdvice {
	//一切业务层接口
    @Pointcut("execution(* cn.stopyc.service.*Service.*(..))")
    private  void pt(){
    }

    @Around("pt()")
    public Object calEffect (ProceedingJoinPoint pjp) throws Throwable {

        //获取签名信息
        Signature signature = pjp.getSignature();
        
        //哪个接口
        String declaringTypeName = signature.getDeclaringTypeName();
        
        //哪个方法
        String name = signature.getName();

        long begin = System.currentTimeMillis();

        Object ret = null;
        for (int i = 0; i < 10000; i++) {
             ret = pjp.proceed();
        }

        long end = System.currentTimeMillis() - begin;

        System.out.println(declaringTypeName + "."+ name + "     "+end);

        return ret;
    }
}

```

## AOP获取参数,返回值,异常

```java
@Component
@Aspect
public class MyAdvice {
    @Pointcut("execution(void com.itheima.dao.BookDao.update())")
    private void pt(){}
    
    //有返回值的切入点
    @Pointcut("execution(int com.itheima.dao.BookDao.select())")
    private void pt2(){}
    
    @Around("pt2()")
    public Object aroundSelect(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("around before advice ...");
        //表示对原始操作的调用,ret接返回值,
        
        //参数
        Object[] args = pjp.getArgs();
        System.out.println(Arrays.toString(args));
        
        //参数可以进行手动修改,可以进行参数的规范,提高代码的健壮性.记得传参.
        args[0] = 1;
        
        //返回值
        Object ret = pjp.proceed(args);
        System.out.println("around after advice ...");
        
        //异常,不抛出异常,直接捕获,文中为抛出异常.
        return ret;
    }
}
```

# Spring事务

## JdbcConfig

```java
package cn.stopyc.config;

import com.alibaba.druid.pool.DruidDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;


/**
 * @program: spring_01_quickstart
 * @description:
 * @author: stop.yc
 * @create: 2022-07-18 15:00
 **/
public class JdbcConfig {
    //添加简单数据类型,如何配置请看上面介绍

    @Value("${jdbc.driver}")
    private String driver;
    @Value("${jdbc.url}")
    private String url;
    @Value("${jdbc.username}")
    private String username;
    @Value("${jdbc.password}")
    private String password;


    //1.定义一个方法获得要管理的对象
    //2.添加@Bean,表示当前方法的返回值是一个bean

    //3.添加引用类型,只要引用类型是被加载到容器当中,直接加入形参即可
    @Bean
    public DataSource dataSource () {
        DruidDataSource ds = new DruidDataSource();
        ds.setDriverClassName(driver);
        ds.setUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);
        return ds;
    }

    //配置事务管理器，mybatis使用的是jdbc事务
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource){
        DataSourceTransactionManager transactionManager = new DataSourceTransactionManager();
        transactionManager.setDataSource(dataSource);
        return transactionManager;
    }
}
```

## SpringConfig

```java
package cn.stopyc.config;

import org.springframework.context.annotation.*;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * @program: spring_01_quickstart
 * @description:
 * @author: stop.yc
 * @create: 2022-07-18 14:57
 **/
@Configuration
@ComponentScan("cn.stopyc")
@PropertySource("classpath:jdbc.properties")
@Import({JdbcConfig.class,MybatisConfig.class})
@EnableAspectJAutoProxy
@EnableTransactionManagement
public class SpringConfig {

}
```

## 业务接口

````java
package cn.stopyc.service;

import cn.stopyc.po.User;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
public interface UserService {
    List<User> selectAll();
    List<User> selectAll1();
//    void save();
//
//    void update();
    boolean login(String username,String password);


    void upAndDown(int id1,int id2);
}

````

 ## Spring事务属性

### 事务配置

![image-20220719093831793](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207190938902.png)

> Spring的事务只会对`Error异常`和`RuntimeException异常`及其子类进行事务回顾，其他的异常类型是不会回滚的，对应IOException不符合上述条件所以不回滚,所以需要另外设置IOException事务回滚

```java
 @Transactional(rollbackFor = {IOException.class})
```

### 事务传播行为

> 当一些方法作为事务协调者加入管理者之后,那么就认为是一个事务,只有一个原子,所以是一起失败一起成功,但是,现在业务要求的是,需要为一些业务记录日志,那么日志就是既要对失败进行记录,也要对成功进行记录, 成功记录当然可以,但是失败记录呢,因为事务的问题,我们可以得知是不会进行记录的.所以我们通过事务传播,新建一个事务.

```java
//对需要额外新建事务的方法或者接口,加上
@Transactional(propagation = Propagation.REQUIRES_NEW)
```

### 项目结构

![image-20220719094447930](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207190944003.png)

### LogMapper

```java
@Mapper
@Repository
public interface LogMapper {

    @Insert("insert into t_log (`out`,`in`,money) values (#{out},#{in},#{money})")
    void log(@Param("out") String out,@Param("in") String in, @Param("money") double money);
}
```

### LogService

```java
public interface LogService {

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void log(String out,String  in,double money);
}
```

### LogServiceImpl

```java
@Service
public class LogServiceImpl implements LogService {

    @Autowired
    private LogMapper logMapper;

    @Override

    public void log(String out, String in, double money) {
        logMapper.log(out,in,money);
    }
}
```

### UserServiceImpl

```java
@Override
    public void upAndDown(int id1,int id2) {

        //记得加try-finally,不然log也不会进行
        try {userMapper.up(id1);

            int i = 1 / 0;

            userMapper.down(id2);
        } finally {
            logService.log(id1+"",id2+"",100);
        }
    }
```

#  SpringMVC

## 创建Maven+web项目

[创建Maven+web项目]()https://blog.csdn.net/qq_61956639/article/details/125869171

## 项目结构

![image-20220719120158255](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207191201324.png)

## 导入依赖

首先将pom.xml多余的内容删除,再添加SpringMvc的依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>springmvc_dmoe02</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>war</packaging>


    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>3.1.0</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>5.2.10.RELEASE</version>
        </dependency>
    </dependencies>


</project>

```

## SpringMvcConfig

```java
//3. 创建springmvc的配置文件,加载controller对应的bean
@Configuration
@ComponentScan("cn.stopyc.controller")
public class SpringMvcConfig {
}
```

## SpringContainersInitConfig

首先先删除web.xml

```java
//4.定义一个servlet容器启动的配置类,在里面加载spring的配置
public class SpringContainersInitConfig extends AbstractDispatcherServletInitializer {
    //加载springmvc的容器配置
    @Override
    protected WebApplicationContext createServletApplicationContext() {
        AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
        ctx.register(SpringMvcConfig.class);
        return ctx;
    }

    //设置哪些请求归属springMVC处理
    @Override
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }

    //加载spring容器配置
    @Override
    protected WebApplicationContext createRootApplicationContext() {
        return null;
    }
}
```

## UserController

```java
//2.定义controller
//2.1 使用@Controller定义bean
@Controller
public class UserController {

    //2.2 设置当前操作的访问路径
    @RequestMapping("/save")
    //2.3 设置当前操作的返回值类型
    @ResponseBody
    public String save() {
        System.out.println("user save ...");
        return "{'module':'springmvc'}";
    }
}
```

## 运行项目

tomcat启动项目,在路径末尾写上save

## 区分Spring和SpringMVC的环境

防止Spring加载Controller.

1. 方式一:精准定位扫描路径(推荐)

```java
@Configuration
@ComponentScan({"cn.stopyc.dao","cn.stopyc.service"})
@PropertySource("classpath:jdbc.properties")
@Import({JdbcConfig.class,MybatisConfig.class})
@EnableAspectJAutoProxy
@EnableTransactionManagement
public class SpringConfig {
}
```

2. 方式二,排除指定包路径

```java
@Configuration
@ComponentScan(value="cn.stopyc",
    excludeFilters=@ComponentScan.Filter(
    	type = FilterType.ANNOTATION,
        classes = Controller.class
    )
)
@PropertySource("classpath:jdbc.properties")
@Import({JdbcConfig.class,MybatisConfig.class})
@EnableAspectJAutoProxy
@EnableTransactionManagement
public class SpringConfig {

}

```

### Tomcat加载Spring环境

```java
public class ServletContainersInitConfig extends AbstractDispatcherServletInitializer {
    protected WebApplicationContext createServletApplicationContext() {
        AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
        ctx.register(SpringMvcConfig.class);
        return ctx;
    }
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }
    protected WebApplicationContext createRootApplicationContext() {
      AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
        ctx.register(SpringConfig.class);
        return ctx;
    }
}
```

**简化开发**

```java
public class ServletContainersInitConfig extends AbstractAnnotationConfigDispatcherServletInitializer {

    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{SpringConfig.class};
    }

    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{SpringMvcConfig.class};
    }

    protected String[] getServletMappings() {
        return new String[]{"/"};
    }
}
```

## Postman

Postman汉化:**[Github](https://github.com/hlmd/Postman-cn)**  

## 设置请求映射路径

```java
@Controller
@RequestMapping("/book")
public class BookController {

    @RequestMapping("/save")
    @ResponseBody
    public String save() {
        System.out.println("book save ...");
        return "{'module':'springmvc'}";
    }
}
```

## get请求

```java
@Controller
@RequestMapping("/book")
public class BookController {

    @RequestMapping("/save")
    @ResponseBody
    public String save(String name,int age) {
        System.out.println("book save ...");
        return "{'module':'springmvc'}";
    }
}

//请求路径:......save?name=张三&age=14
```

## post请求

```java
//写法同get请求一样,但是需要处理中文乱码的问题
//4.定义一个servlet容器启动的配置类,在里面加载spring的配置
public class SpringContainersInitConfig extends AbstractDispatcherServletInitializer {
    //加载springmvc的容器配置
    @Override
    protected WebApplicationContext createServletApplicationContext() {
        AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
        ctx.register(SpringMvcConfig.class);
        return ctx;
    }

    //设置哪些请求归属springMVC处理
    @Override
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }

    //加载spring容器配置
    @Override
    protected WebApplicationContext createRootApplicationContext() {
        AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
        ctx.register(SpringConfig.class);
        return null;
    }

    //使用过滤器,对传进来的参数进行字符集编码的设置
    @Override
    protected Filter[] getServletFilters() {
        CharacterEncodingFilter filter = new CharacterEncodingFilter();
        filter.setEncoding("UTF-8");
        return new Filter[]{filter};
    }
}
```

## 各种参数接收

```java
@Controller
@RequestMapping("/book")
public class BookController {

    //请求的参数和形参的名字一一对应
    @RequestMapping("/save")
    @ResponseBody
    public String save(String name,int age) {
        System.out.println("book save ...");
        return "{'module':'springmvc'}";
    }
    
    //请求的参数和形参的名字不一致
    @RequestMapping("/save1")
    @ResponseBody
    public String save1(@RequestParam("username")String name,@RequestParam("age2")int age) {
        System.out.println("book save ...");
        return "{'module':'springmvc'}";
    }
    
    
    
    //请求发送实体类中的属性信息,如果名称一一对应,则自动封装为实体类对象 
    @RequestMapping("/save2")
    @ResponseBody
    public String save2(User user) {
        System.out.println(user);
        return "{'module':'springmvc'}";
    }
    
    //如果实体类中的属性有引用类型,则前端请求需要写为  引用类型.字段信息
     @RequestMapping("/save3")
    @ResponseBody
    public String save3(User user) {
        System.out.println(user);
        return "{'module':'springmvc'}";
    }
    
    
    //数组参数,则前端只需要参数名称全部统一为likes即可
     @RequestMapping("/save4")
    @ResponseBody
    public String save4(String[] likes) {
        System.out.println(likes);
        return "{'module':'springmvc'}";
    }
    
    
    //集合参数,前端只需要参数名称全部统一为likes即可,后台需要加上注解 @RequestParam
     @RequestMapping("/save5")
    @ResponseBody
    public String save5(@RequestParam List<String> likes) {
        System.out.println(likes);
        return "{'module':'springmvc'}";
    }
}
```

## Json格式数据传递

### 导入依赖

```xml
<dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.9.0</version>
    </dependency>
```

### SpringMvcConfig

```java
@Configuration
@ComponentScan("cn.stopyc.controller")
@EnableWebMvc
public class SpringMvcConfig {
}
```

### controller

```java
//注意是body,前面是直接以get请求,所以是param
//集合参数,前端只需要参数名称全部统一为likes即可,后台需要加上注解 @RequestBody
//请求集合json参数
//["aa","bb","cc"]
@RequestMapping("/save5")
@ResponseBody
public String save5(@RequestBody List<String> likes) {
    System.out.println(likes);
    return "{'module':'springmvc'}";
}


//实体类参数,后台需要加上注解 @RequestBody
//请求实体类对象json参数
//{"username":"张三}
@RequestMapping("/save5")
@ResponseBody
public String save5(@RequestBody User user) {
    System.out.println(user);
    return "{'module':'springmvc'}";
}



//实体类集合参数,后台需要加上注解 @RequestBody
//请求实体类对象json参数
//{{"username":"李四"},{"username":"张三"},{"username":"王五"}}
@RequestMapping("/save5")
@ResponseBody
public String save5(@RequestBody List<User> users) {
    System.out.println(users);
    return "{'module':'springmvc'}";
}

```

## 日期格式参数

```java
//日期格式,springmvc默认为yyyy/MM/dd,所以其他日期格式需要进行指定日期格式.
@RequestMapping("/save5")
@ResponseBody
public String save5(Date date,@DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss") Date date1) {
    System.out.println(date+date1);
    return "{'module':'springmvc'}";
}
```

## 响应

### 响应页面

```java
@RequestMapping("/jumpPage")
public String jumpPage() {
    return "hello.html";
}
```

## 响应文本数据

```java
@RequestMapping("/toText")
@ResponseBody
public String toText() {
    return "hello world";
}
```

## 响应实体类对象

```java
@RequestMapping("/toJson")
@ResponseBody
public User toJson() {
    User user = new User();
    return user;
}
```

## 响应实体类集合对象

```java
@RequestMapping("/toJsonCollection")
@ResponseBody
public List<User> toJsonCollection() {
    List<User> list = new ArrayList<>();
    list.add( new User());
    list.add( new User());
    return list;
}
```

## REST风格简介

![image-20220719165159653](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207191651742.png)

## REST风格开发

```java
@RestController
@RequestMapping("/users")
public class BookController {
    @PostMapping
    public User save(@RequestBody User user) {
        System.out.println("save" + user);
        return user;
    }

    @GetMapping("/{id}")
    public User get(@PathVariable int id) {
        System.out.println("getUserByUserId = " + id);
        return new User();
    }

    @GetMapping
    public List<User> getAll() {
        System.out.println("get All users");
        ArrayList<User> list = new ArrayList<>();
        list.add(new User());
        return list;
    }

    @PutMapping
    public void update(@RequestBody User user) {
        System.out.println("update " + user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        System.out.println("delete" + id);
    }
}
```

![image-20220719172826741](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207191728801.png)

![image-20220719172836557](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207191728616.png)

![image-20220719172845506](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207191728571.png)

![image-20220719172853784](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207191728850.png)

![image-20220719172902048](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207191729113.png)

## SSM整合

[Github](https://github.com/stopyc/public_study/tree/main/SSM%E6%95%B4%E5%90%88%E6%A1%86%E6%9E%B6/springmvc_05_all)

## Result 封装结果集

[Result封装结果集](https://blog.csdn.net/qq_61956639/article/details/124679069)

## 异常处理器

![image-20220719220441467](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207192204550.png)

```java
@RestControllerAdvice
public class ProjectExceptionAdvice {
    @ExceptionHandler(Exception.class)
    public Result<Object> doException(Exception e){
        return new Result<>(500,"服务器崩了",null);
    }
}
```

## 项目异常处理

### 项目结构

![image-20220719222733484](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207192227554.png)

### 自定义异常

```java
//自定义异常处理器，用于封装异常信息，对异常进行分类
public class BusinessException  extends RuntimeException{
    private Integer code;

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(Integer code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}
```

```java
//自定义异常处理器，用于封装异常信息，对异常进行分类
public class SystemException extends RuntimeException {

    private Integer code;

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public SystemException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public SystemException(Integer code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}
```

### 异常拦截器

```java
//@RestControllerAdvice用于标识当前类为REST风格对应的异常处理器
@RestControllerAdvice
public class ProjectExceptionAdvice {
    //@ExceptionHandler用于设置当前处理器类对应的异常类型
    @ExceptionHandler(SystemException.class)
    public Result doSystemException(SystemException ex){
        //记录日志
        //发送消息给运维
        //发送邮件给开发人员,ex对象发送给开发人员
        return new Result(ex.getCode(),ex.getMessage(),null);
    }

    @ExceptionHandler(BusinessException.class)
    public Result doBusinessException(BusinessException ex){
        return new Result(ex.getCode(),ex.getMessage(),null);
    }

    //除了自定义的异常处理器，保留对Exception类型的异常处理，用于处理非预期的异常
    @ExceptionHandler(Exception.class)
    public Result doOtherException(Exception ex){
        //记录日志
        //发送消息给运维
        //发送邮件给开发人员,ex对象发送给开发人员
        return new Result(ResultEnum.UNKNOWN_ERROR.getCode(),ResultEnum.UNKNOWN_ERROR.getMsg(),null);
    }
}
```

### 业务层

```java
@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private  UserMapper userMapper;

    @Override
    public Result<Integer> login(String username, String password) {
        if (username == null || "".equals(username)) {
            throw new BusinessException(ResultEnum.PARAMETER_NOT_VALID.getCode(),"请正确输入",null);
        }


        try {
            int i = 1 / 0;
        } catch (Exception e) {
            throw new SystemException(ResultEnum.SERVER_INTERNAL_ERROR.getCode(),"服务器访问超时,请重试",e);
        }

        User user = userMapper.selectByNameAndPassword(username, password);

        if (user == null) {
            return new Result<>(ResultEnum.PASSWORD_FAILED.getCode(), ResultEnum.PASSWORD_FAILED.getMsg(), -1);
        } else  {
            user.setPassword("");
            return new Result<>(ResultEnum.SUCCESS.getCode(), ResultEnum.SUCCESS.getMsg(), user.getPosition());
        }
    }
}
```

## 拦截器

### 项目结构

![image-20220720150005853](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207201500911.png)

### ProjectIntercepter

```java
//ProjectIntercepter2同理
@Component
public class ProjectInterceptor implements HandlerInterceptor {

    @Override
    //原始方法调用前执行的内容
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("preHandle...");
        return true;
    }

    @Override
    //原始方法调用后执行的内容
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("postHandle...");
    }

    @Override
    //原始方法调用完成后执行的内容
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("afterCompletion...");
    }
}
```

### SpringMvcSupport

```java
@Configuration
public class SpringMvcSupport extends WebMvcConfigurationSupport {
    @Autowired
    private ProjectInterceptor projectInterceptor;


    @Autowired
    private ProjectInterceptor2 projectInterceptor2;


    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/pages/**").addResourceLocations("/pages/");
        registry.addResourceHandler("/js/**").addResourceLocations("/js/");
        registry.addResourceHandler("/img/**").addResourceLocations("/img/");
        registry.addResourceHandler("/element-ui/**").addResourceLocations("/element-ui/");
        registry.addResourceHandler("/webapp/**").addResourceLocations("/webapp/");
    }

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        //配置拦截器
        registry.addInterceptor(projectInterceptor).addPathPatterns("/users","/users/*" );
        registry.addInterceptor(projectInterceptor2).addPathPatterns("/users","/users/*" );
    }
}
```

### 拦截器链配置

![image-20220720145927407](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202207201459576.png)

# Springboot

## Springboot入门程序

1. 新建项目

![image-20220804204316890](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042043996.png)

2. 选择spring initializr，jdk版本选择1.8，点击next

![image-20220804204406286](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042044374.png)

3. 记得选择jdk8，其他根据提示进行，next

![image-20220804204535467](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042045571.png)

4. 选择web，选择spring web，点击next，点击finish

![image-20220804204626233](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042046328.png)

5. 删除图中的目录

![image-20220804204747324](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042047398.png)

6. pom文件增加这些东西，

```xml
//spring配置注解处理器
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>

//打包时跳过测试
<properties>
        <java.version>1.8</java.version>

        <!-- 跳过测试 -->
        <skipTests>true</skipTests>
    </properties>

//加载maven阿里云仓库
<repositories>
        <repository>
            <id>spring-snapshots</id>
            <url>http://repo.spring.io/libs-snapshot</url>
        </repository>
    </repositories>

    <pluginRepositories>
        <pluginRepository>
            <id>spring-snapshots</id>
            <url>http://repo.spring.io/libs-snapshot</url>
        </pluginRepository>
    </pluginRepositories>


//识别版本
   <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
<!--                这个为你的springboot的版本-->
                <version>2.7.2</version>
            </plugin>
        </plugins>
    </build>
```

7. 设置-构建,执行,部署-构建工具-maven。路径选择你的maven相关东西

![image-20220804205045829](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042050924.png)

8. 清除缓存， 重启idea。

![image-20220804205107707](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042051774.png)

9. 增加controller包

```java
@RestController
@RequestMapping("/books")
public class BookController {

    @GetMapping("/{id}")
    public String getById(@PathVariable Integer id) {
        System.out.println("id = " + id);
        return "hello,springboot!";
    }
}
```

10. 运行Application，成功运行

![image-20220804205655428](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042056516.png)

11. postman发送请求

![image-20220804205726756](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042057828.png)

## Springboot配置文件

### application.properties(最高优先级)

```properties
server.port=8081
```

### application.yml(记得键值对中间的冒号需要多一个空格,优先级其次)

```yaml
server:
  port: 81
```

### application.yaml(记得键值对中间的冒号需要多一个空格,最低优先级)

```yaml
server:
  port: 81
```

### 配置文件提示

1. 点击项目结构,点击facet

![image-20220804214056387](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042140469.png)

2. 选择spring,选择配置文件一项,点击springboot图标![image-20220804214132148](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042141226.png)

3. 点击+号![image-20220804214142851](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042141933.png)

4. 选择你的配置文件,进行加入

   ![image-20220804214153966](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042141032.png)

6. 回到配置文件,现在已经有了提示

   ![image-20220804214214127](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042142200.png)

### yaml语法规则

![image-20220804215329333](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042153406.png)

![image-20220805094938468](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208050949542.png)

### yaml读取数据格式

**application.yaml**

```yaml
lesson: SpringBoot

enterprise:
  name: stopyc
  age: 18
  tel: 1234
  subject:
    - java
    - 前端
    - mysql
    - netty
    - redis
    - ssm


server:
  port: 8081
logging:
  level:
   root: warn
```

**BookController**

```java

@RestController
@RequestMapping("/books")
public class BookController {

    @Value("${lesson}")
    private String lesson;

    @Value("${server.port}")
    private Integer port;

    @Value("${enterprise.subject[0]}")
    private String subject_00;

    @Autowired
    private Environment environment;


    @Autowired
    private Enterprise enterprise;

    @GetMapping("/{id}")
    public String getById(@PathVariable Integer id) {
        System.out.println("id = " + id);
        //读取单个属性
        System.out.println("lesson = " + lesson);
        System.out.println("port = " + port);
        System.out.println("subject_00 = " + subject_00);
        System.out.println("----------------------");
        
        //使用环境变量,把所有属性全部读取,进行封装
        System.out.println("environment = " + environment.getProperty("lesson"));
        System.out.println("environment = " + environment.getProperty("server.port"));
        System.out.println("environment = " + environment.getProperty("enterprise.subject[1]"));
        System.out.println("----------------------");
        
        //使用实体类,对某一个类别的属性进行封装.
        System.out.println("enterprise = " + enterprise);

        return "hello,springboot!";
    }
}
```

**Enterprise**

```java
@Component
@ConfigurationProperties(prefix = "enterprise")
public class Enterprise {
    private String name;
    private int age;
    private String tel;
    private String[] subject;

    @Override
    public String toString() {
        return "Enterprise{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", tel='" + tel + '\'' +
                ", subject=" + Arrays.toString(subject) +
                '}';
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }

    public String[] getSubject() {
        return subject;
    }

    public void setSubject(String[] subject) {
        this.subject = subject;
    }
}
```

## 多环境开发配置

```yaml
# 公用的配置
logging:
  level:
    root: info

# 设置启用的环境
spring:
  profiles:
    active: dev

---
# 开发
spring:
  config:
    activate:
      on-profile: dev

server:
  port: 8080

---
# 生产
spring:
  config:
    activate:
      on-profile: pro

server:
  port: 8081

---
# 测试
spring:
  config:
    activate:
      on-profile: test

server:
  port: 8082
---
```

## 多环境命令行启动

1. 打包(重点!!!!!!!!!!!!!!)
   1. maven-clean
   2. 文件-设置-搜索encode,.把编码格式都换成utd-8
   3. 关闭application.yml文件,重新打开,并处理存在的乱码
   4. maven-package
   5. 注:如果在打包时出现test测试类错误,则在pom文件里加上

```xml
<properties>
 	<!-- 跳过测试 -->
    <skipTests>true</skipTests>
</properties>
```

2. 命令行临时修改参数运行

```shell
java -jar your_projectname.jar --spring.profiles.active=test --server.port=8088
```

## 配置文件分类

![image-20220805110202496](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208051102584.png)

测试人员只需重写一个配置文件放在jar包的同级目录下,即可生效

## Springboot整合junit测试框架

直接在test类注入资源就行

```java

@SpringBootTest
class ApplicationTests {

    @Autowired
    private BookService bookService;

    @Test
    void contextLoads() {
        bookService.save();
    }

}
```

## Springboot整合ssm保姆流程

1. 新建项目，选择Spring initializr，选择jdk![image-20220805113330834](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208051133911.png)

2. 如图![image-20220805113457944](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208051134020.png)

3. 勾选依赖![image-20220805113514254](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208051135328.png)

![image-20220805113540260](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208051135330.png)

4. 删除无关的文件![image-20220805113626821](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208051136887.png)

5. pom.xml文件添加

```xml
//spring配置注解处理器
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>
//添加数据源
 <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.1.16</version>
        </dependency>

//打包时跳过测试
<properties>
        <java.version>1.8</java.version>

        <!-- 跳过测试 -->
        <skipTests>true</skipTests>
    </properties>

//加载maven阿里云仓库
<repositories>
        <repository>
            <id>spring-snapshots</id>
            <url>http://repo.spring.io/libs-snapshot</url>
        </repository>
    </repositories>

    <pluginRepositories>
        <pluginRepository>
            <id>spring-snapshots</id>
            <url>http://repo.spring.io/libs-snapshot</url>
        </pluginRepository>
    </pluginRepositories>


//识别版本
   <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
<!--                这个为你的springboot的版本-->
                <version>2.7.2</version>
            </plugin>
        </plugins>
    </build>
```

6. 设置-构建,执行,部署-构建工具-maven。路径选择你的maven相关东西

![image-20220804205045829](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042050924.png)

7. 设置-编辑器-文件编码设置为utf-8![image-20220805113853402](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208051138485.png)

8. 清除缓存， 重启idea。

![image-20220804205107707](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208042051774.png)

9. application.yml文件内容

```yaml


spring:
  datasource:
    driver-class-name: com.mysql.jdbc.Driver
    username: root
    password: root
    url: jdbc:mysql://localhost:3306/smp?useUnicode=true&characterEncoding=UTF-8&useSSL=false
    type: com.alibaba.druid.pool.DruidDataSource
  profiles:
    active: dev



---
# 开发
spring:
  config:
    activate:
      on-profile: dev

server:
  port: 8080

---
# 生产
spring:
  config:
    activate:
      on-profile: pro

server:
  port: 80

---
```

10. 测试框架

+ 只需在测试类上加上注解@SpringBootTest

11. springmvc

+ 只需在dao层加上注解@Mapper

12. 附:slf4j+log4j2整合

    1. 首先排除springboot自带的日志框架,找到依赖,增加排除

    ```xml
    <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
                <exclusions>
                    <!--                排除自带的日志记录框架-->
                    <exclusion>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-starter-logging</artifactId>
                    </exclusion>
                </exclusions>
            </dependency>
    ```

    2. 加入相关日志依赖

    ```xml
    <!--        使用log4j2日志框架-->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-log4j2</artifactId>
            </dependency>
            <!--导入log4j2 的异步日志依赖-->
            <dependency>
                <groupId>com.lmax</groupId>
                <artifactId>disruptor</artifactId>
                <version>3.3.4</version>
            </dependency>
    
    ```

    

    3. resources包下新建log4j2.xml和log4j2.component.properties

```xml
<!--xml文件-->

<?xml version="1.0" encoding="UTF-8"?>
<!--日志级别以及优先级排序: OFF > FATAL > ERROR > WARN > INFO > DEBUG > TRACE > ALL -->
<!--
    status="warn" Configuration后面日志框架本身的输出日志级别,可以不加入
    monitorInterval="5" 自动加载配置文件的间隔时间, 不低于 5 秒
    注: 我们的配置文件修改后在生产环境下无需重启应用, 可以实现热更新的效果
-->
<Configuration monitorInterval="5">

    <!--TODO 全局属性 ,发布后路径记得改-->
    <Properties>
        <Property name="APP_NAME">qg-log4j2</Property>
        <Property name="LOG_FILE_PATH">E:/logs/${APP_NAME}</Property>
        <Property name="PATTERN_FORMAT">%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level %class{36} %L %M - %msg%xEx%n</Property>
    </Properties>

    <!--输出源-->
    <Appenders>

        <!--输出到控制台-->
        <Console name="Console" target="SYSTEM_ERR"><!--输出的类型SYSTEM_ERR-->
            <PatternLayout pattern="${PATTERN_FORMAT}"/>
            <!-- 控制台只输出level及以上级别的信息(onMatch),其他的直接拒绝(onMismatch) . -->
<!--            TODO-->
            <ThresholdFilter level="DEBUG" onMatch="ACCEPT"
                             onMismatch="DENY" />
        </Console>


<!--        &lt;!&ndash;输出info信息日志到文件 用来定义超过指定大小自动删除旧的创建新的的Appender.&ndash;&gt;-->
<!--        <RollingFile name="RollingInfoFile" fileName="${LOG_FILE_PATH}/info.log"-->
<!--                     filePattern="${LOG_FILE_PATH}/$${date:yyyyMM}/info-%d{yyyyMMdd}-%i.log.gz">-->
<!--            &lt;!&ndash;控制台只输出level及以上级别的信息（onMatch），其他的直接拒绝（onMismatch）&ndash;&gt;-->
<!--            <Filters>-->
<!--                <ThresholdFilter level="warn" onMatch="DENY" onMismatch="NEUTRAL"/>  &lt;!&ndash;高于warn级别就放行,低于这个级别就拦截&ndash;&gt;-->
<!--                <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>-->
<!--            </Filters>-->

<!--            <PatternLayout>-->
<!--                <pattern>${PATTERN_FORMAT}</pattern> &lt;!&ndash;文件路径&ndash;&gt;-->
<!--            </PatternLayout>-->

<!--            &lt;!&ndash;设置文件具体拆分规则&ndash;&gt;-->
<!--            <Policies>-->
<!--                &lt;!&ndash;在系统启动时, 触发拆分规则，生产一个新的日志文件&ndash;&gt;-->
<!--                <OnStartupTriggeringPolicy/>-->
<!--                &lt;!&ndash;按照文件大小拆分, 30 MB &ndash;&gt;-->
<!--                <SizeBasedTriggeringPolicy size="30 MB"/>-->
<!--                &lt;!&ndash;按照时间节点拆分, 规则根据filePattern定义的&ndash;&gt;-->
<!--                <TimeBasedTriggeringPolicy/>-->
<!--            </Policies>-->
<!--            &lt;!&ndash;在同一个目录下，文件的个数限定为 30 个, 超过进行覆盖&ndash;&gt;-->
<!--            <DefaultRolloverStrategy max="30"/>-->
<!--        </RollingFile>-->


        <!--输出警告日志到文件-->
        <RollingFile name="RollingWarnFile" fileName="${LOG_FILE_PATH}/warn.log"
                     filePattern="${LOG_FILE_PATH}/$${date:yyyyMM}/warn-%d{yyyyMMdd}-%i.log.gz">
            <!--控制台只输出level及以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
            <Filters>
                <ThresholdFilter level="error" onMatch="DENY" onMismatch="NEUTRAL"/>
                <ThresholdFilter level="warn" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>

            <PatternLayout>
                <pattern>${PATTERN_FORMAT}</pattern> <!--文件路径-->
            </PatternLayout>

            <!--设置文件具体拆分规则-->
            <Policies>
                <!--在系统启动时, 触发拆分规则，生产一个新的日志文件-->
                <OnStartupTriggeringPolicy/>
                <!--按照文件大小拆分, 30 MB -->
                <SizeBasedTriggeringPolicy size="30 MB"/>
                <!--按照时间节点拆分, 规则根据filePattern定义的-->
                <TimeBasedTriggeringPolicy/>
            </Policies>
            <!--在同一个目录下，文件的个数限定为 30 个, 超过进行覆盖-->
            <DefaultRolloverStrategy max="30"/>
        </RollingFile>

        <!--输出错误日志到文件-->
        <RollingFile name="RollingErrorFile" fileName="${LOG_FILE_PATH}/error.log"
                     filePattern="${LOG_FILE_PATH}/$${date:yyyyMM}/error-%d{yyyyMMdd}-%i.log.gz">
            <!--控制台只输出level及以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
            <ThresholdFilter level="error" onMatch="ACCEPT" onMismatch="DENY"/>

            <PatternLayout>
                <pattern>${PATTERN_FORMAT}</pattern>
            </PatternLayout>

            <Policies>
                <!--在系统启动时, 触发拆分规则，生产一个新的日志文件-->
                <OnStartupTriggeringPolicy/>
                <!--按照文件大小拆分, 30 MB -->
                <SizeBasedTriggeringPolicy size="30 MB"/>
                <!--按照时间节点拆分, 规则根据filePattern定义的-->
                <TimeBasedTriggeringPolicy/>
            </Policies>
            <!--在同一个目录下，文件的个数限定为 30 个, 超过进行覆盖-->
            <DefaultRolloverStrategy max="30"/>
        </RollingFile>

        <!--输出debug日志到文件-->
        <RollingFile name="RollingDebugFile" fileName="${LOG_FILE_PATH}/debug.log"
                     filePattern="${LOG_FILE_PATH}/$${date:yyyyMM}/debug-%d{yyyyMMdd}-%i.log.gz">
            <!--控制台只输出level及以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
            <Filters>
                <ThresholdFilter level="info" onMatch="DENY" onMismatch="NEUTRAL"/>  <!--高于warn级别就放行,低于这个级别就拦截-->
                <ThresholdFilter level="debug" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>

            <PatternLayout>
                <pattern>${PATTERN_FORMAT}</pattern> <!--文件路径-->
            </PatternLayout>

            <!--设置文件具体拆分规则-->
            <Policies>
                <!--在系统启动时, 触发拆分规则，生产一个新的日志文件-->
                <OnStartupTriggeringPolicy/>
                <!--按照文件大小拆分, 30 MB -->
                <SizeBasedTriggeringPolicy size="30 MB"/>
                <!--按照时间节点拆分, 规则根据filePattern定义的-->
                <TimeBasedTriggeringPolicy/>
            </Policies>
            <!--在同一个目录下，文件的个数限定为 30 个, 超过进行覆盖-->
            <DefaultRolloverStrategy max="30"/>
        </RollingFile>

    </Appenders>


    <!--定义logger,日志记录器配置-->
    <Loggers>
        <!--过滤掉spring和mybatis的一些无用的DEBUG信息-->
        <Logger name="org.springframework" level="INFO"/>
        <Logger name="org.mybatis" level="INFO"/>

        <!-- LOG "com.luis*" at TRACE level -->
        <Logger name="com.luis" level="INFO"/>

        <!--使用 rootLogger 配置 日志级别 level="trace"-->
        <Root level="ALL">
            <!--指定日志使用的处理器-->
            <AppenderRef ref="Console"/>
            <AppenderRef ref="RollingErrorFile"/>
            <AppenderRef ref="RollingWarnFile"/>
            <AppenderRef ref="RollingInfoFile"/>
            <AppenderRef ref="RollingDebugFile"/>
        </Root>
    </Loggers>

</Configuration>
```

```properties
# propertiesw文件
Log4jContextSelector=org.apache.logging.log4j.core.async.AsyncLoggerContextSelector
```

[参考文章](https://blog.csdn.net/qq_45172779/article/details/117856086?ops_request_misc=&request_id=&biz_id=102&utm_term=springboot%E9%9B%86%E6%88%90SLF4J+Log4j2&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-3-117856086.142^v39^pc_rank_v37,185^v2^control&spm=1018.2226.3001.4187)

# Mybatisplus

## MP入门案例

1. ![image-20220805162055477](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208051620584.png)

2. 引入MP依赖

```xml
<dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.4.1</version>
        </dependency>
```

3. dao层继承BaseMapper<po类>

## 实体类开发

1. 引入依赖

```xml
       <!-- lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.8</version>
            <scope>provided</scope>
        </dependency>
```

2. 在实体类上@Data和构造器方法的注解

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
//如果数据库表名和实体类不是对应关系的话(驼峰对下划线),需加上注解
@TableName("t_user")
```

## 分页功能

1. 新增配置类

```java
@Configuration
public class MpConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor () {
        //1.定义mp拦截器
        MybatisPlusInterceptor mybatisPlusInterceptor = new MybatisPlusInterceptor();
        //2.添加具体的拦截器
        mybatisPlusInterceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        return mybatisPlusInterceptor;
    }

}
```

2. 调用分页方法

```java
IPage page = new Page(1, 2);
userDao.selectPage(page,null);
System.out.println("当前页码值"+page.getCurrent());
System.out.println("每页显示数"+page.getSize());
System.out.println("一共多少页"+page.getPages());
System.out.println("一共多少条数据"+page.getTotal());
System.out.println("数据"+page.getRecords());
```

3. 打开mp的日志 

```yaml
# application.yml
# 开启日志
mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

4. 关闭springboot启动图像

```yaml
main:
    banner-mode: off
```

5. 关闭mp启动图像

```yaml
mybatis-plus:
  global-config:
    banner: false
```

## 分条件查询

```java
QueryWrapper<User> qw = new QueryWrapper<>();
        //1.常规格式
//        qw.lt("permission",2);
//        qw.gt("permission",0);
//        List<User> users = userDao.selectList(qw);
//        System.out.println(users);

        //2.链式编程格式
//        qw.lt("permission",2).gt("permission",0);
//        List<User> users = userDao.selectList(qw);
//        System.out.println(users);

        //3.lambda格式
//        qw.lambda().lt(User::getPermission,2).gt(User::getPermission,0);
//        List<User> users = userDao.selectList(qw);
//        System.out.println(users);

        //4.lambda格式
        LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
        //小于2,大于1
        lqw.lt(User::getPermission,2).gt(User::getPermission,1);
        //比1小或者比3大
        lqw.lt(User::getPermission,1).or().gt(User::getPermission,3);
        List<User> users1 = userDao.selectList(lqw);
        System.out.println(users1);
```

## 条件查询null的判断

```java
User user = new User();
        user.setUsername("lisi");
        user.setPhone_number("12345678912");
        user.setEmail("12@123.com");
        user.setPassword("12331213Aa");
        user.setPermission(1);
        LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
        //ge:大于等于 ,前为条件,如果需要查询的条件不为0,那么则拼接查询语句
        lqw.ge(0 != user.getPermission(),User::getPermission,user.getPermission());
```

## 查询投影

1. 

```java
QueryWrapper<User> qw = new QueryWrapper<>();
//查询条数
  qw.select("count(*)");
//查询指定字段
qw.select("user_id","username");
List<Map<String, Object>> maps = userDao.selectMaps(qw);
System.out.println(maps);
```

2. 

```java
LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
//小于2,大于1
lqw.select(User::getPermission);
List<User> users = userDao.selectList(lqw);
System.out.println(users);
```

3. 

```java
QueryWrapper<User> lqw = new QueryWrapper<>();
lqw.select("count(*)" + "permission");
lqw.groupBy("permission");
List<Map<String, Object>> users = userDao.selectMaps(lqw);
System.out.println(users);
```

## 查询条件

![![image-20220805220845670](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208052208823.png)

![image-20220805220850727](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208052208873.png)

## 映射匹配兼容性

![image-20220805221446619](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208052214777.png)

## 全局配置

1. id生成规则: application.yml输入idtype,选择对应的规则
2. 表名映射规则: 表名前缀,application.yml,输入table-prefix: t_

## 批量删除

![image-20220805223350394](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208052233465.png)

## 逻辑删除

1. 增加逻辑删除字段：deleted，（0表示为删除，1表示已删除）
2. 给实体类增加一个deleted字段，并加上注解@TableLogic（value=“0”，delval=“1”）
3. 现在删除后不是物理删除，而是逻辑删除，而且现在查询语句只能查询到没有被逻辑删除的数据，如果要查询全部，只需自己手写sql语句，直接查询。
4. 全局deleted字段配置，application.yml输入

```yaml
logic-delete-field: deleted
logic-not-delete-value: 0
logic-delete-value: 1
```

## 乐观锁

1. 增加一个version字段

2. 在实体类的version属性增加@Version注解

3. ```
   //3.添加乐观锁的拦截器
   mybatisPlusInterceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
   ```

## 代码生成器

1. 引入依赖

```xml
<!--        代码生成器-->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-generator</artifactId>
            <version>3.4.1</version>
        </dependency>

<!--        velocity模板引擎-->
        
        <dependency>
            <groupId>org.apache.velocity</groupId>
            <artifactId>velocity-engine-core</artifactId>
            <version>2.3</version>
        </dependency>
```

2. 创建代码生成器类

```java
public class CodeGenerator {
    public static void main(String[] args) {
        //1.获取代码生成器的对象
        AutoGenerator autoGenerator = new AutoGenerator();

        //设置数据库相关配置
        DataSourceConfig dataSource = new DataSourceConfig();
        dataSource.setDriverName("com.mysql.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://localhost:3306/mybatisplus_db?serverTimezone=UTC");
        dataSource.setUsername("root");
        dataSource.setPassword("123456");
        autoGenerator.setDataSource(dataSource);

        //设置全局配置
        GlobalConfig globalConfig = new GlobalConfig();
        globalConfig.setOutputDir(System.getProperty("user.dir")+"/mybatisplus_04_generator/src/main/java");    //设置代码生成位置
        globalConfig.setOpen(false);    //设置生成完毕后是否打开生成代码所在的目录
        globalConfig.setAuthor("stopyc");    //设置作者
        globalConfig.setFileOverride(true);     //设置是否覆盖原始生成的文件
        globalConfig.setMapperName("%sDao");    //设置数据层接口名，%s为占位符，指代模块名称
        globalConfig.setIdType(IdType.ASSIGN_ID);   //设置Id生成策略
        autoGenerator.setGlobalConfig(globalConfig);

        //设置包名相关配置
        PackageConfig packageInfo = new PackageConfig();
        packageInfo.setParent("cn.stopyc");   //设置生成的包名，与代码所在位置不冲突，二者叠加组成完整路径
        packageInfo.setEntity("po");    //设置实体类包名
        packageInfo.setMapper("dao");   //设置数据层包名
        autoGenerator.setPackageInfo(packageInfo);

        //策略设置
        StrategyConfig strategyConfig = new StrategyConfig();
        strategyConfig.setInclude("tb_user");  //设置当前参与生成的表名，参数为可变参数
        strategyConfig.setTablePrefix("tb_");  //设置数据库表的前缀名称，模块名 = 数据库表名 - 前缀名  例如： User = tbl_user - tbl_
        strategyConfig.setRestControllerStyle(true);    //设置是否启用Rest风格
        strategyConfig.setVersionFieldName("version");  //设置乐观锁字段名
        strategyConfig.setLogicDeleteFieldName("deleted");  //设置逻辑删除字段名
        strategyConfig.setEntityLombokModel(true);  //设置是否启用lombok
        autoGenerator.setStrategy(strategyConfig);
        //2.执行生成操作
        autoGenerator.execute();
    }
}
```

# 项目小知识

## 参数校验

1. 引入jsr303相关依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

2. 使用注解对实体类进行参数校验
