springboot连接neo4j

# 配置

1. 创建web工程
2. 把springboot版本换为2.3.5

```xml
<parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.5.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
```

3. 导入关键依赖

```xml
 <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-neo4j</artifactId>
</dependency>
```

4. 添加配置文件

```yaml
spring:
  data:
    neo4j:
      uri: bolt://IP:7687
      username: neo4j
      password: neo4j
```

# MVC

书写类有两种方式，一种是没有关系类，一种是有，可以根据需要进行选择。

## 方式一：没有关系类

1. 书写node实体类

```java
@Data
@NoArgsConstructor
//结点,为你neo4j数据库的结点名称
@NodeEntity("root")
@AllArgsConstructor
public class Root implements Serializable {
    
    //指明为id,可以加id生成策略
    @Id
    private Long id;

    //该注解为属性,对应你数据库的名称
    @Property("name")
    private String name;

    //这个为关系,type为你数据库中的名称
    @Relationship(type = "团队")
    private List<Team> teams;
}
```

2. 书写dao层

```java
//固定格式
@Repository
public interface RootRepository extends Neo4jRepository<Root,Long> {
}
```

3. 书写sevice

```java
@Service
@Transactional
public class RootServiceImpl implements RootService {



    @Autowired
    private RootRepository rootRepository;

    @Override
    public Result getAll() {
        return new Result(rootRepository.findAll());
    }
}
```

4. controller

```java
@RestController
@RequestMapping(value = "/roots",produces = "application/json;charset=UTF-8")
public class RootController {
    @Resource
    private RootService rootService;

    @GetMapping
    Result getAll() {
        return rootService.getAll();
    }
}
```

## 方式二：有关系类

1. node实体类1

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@NodeEntity("keyword")
public class KeyWord{

    @Id
    @GeneratedValue
    private Long id;


    @Property("name")
    private String name;

}
```

2. node实体类2

```java
@Data
@NodeEntity("paper")
@NoArgsConstructor
@AllArgsConstructor
public class Paper{

    @Id
    private Long id;

    @Property("author")
    private String author;

    @Property("date")
    private Long date;

    @Property("keyword")
    private String keyword;

    @Property("periodicals")
    private String periodicals;

    @Property("title")
    private String title;
}
```

3. 关系类

```java
@RelationshipEntity("关键词")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class KeyWordRelation {

    @Id
    @GeneratedValue
    private Long id;

    @StartNode
    private Paper src;

    @EndNode
    private KeyWord dest;
}
```

4. controller，dao，service一样的书写逻辑。
