java封装统一结果集

> 原文地址(鱼皮yyds啊)

[如何优雅地写controller层代码](https://mp.weixin.qq.com/s/IUR29bd2_Zo2AMdzAVDheQ)

> 以前写的第一代结果集

[java封装结果集](https://blog.csdn.net/qq_61956639/article/details/124679069)

# 存在问题

一个用户的操作，比如登录，就可能会有很多种情况，用户层面的：账号错误、密码错误；服务器层面的：数据库错误等等情况。但是我们正常的是直接把一个对象解析成json对象返回给前端，那我们如何去判断是哪一种情况，并给用户一个反馈信息呢？前端就犯困了。这时候，我们就想出了一个方法，既然都是对象，那我能不能嵌套对象，一个对象包含状态码，提示信息，和返回值呢，这时候统一结果集就孕育而生了。

# 解决思路

1. 对象嵌套，包装一个对象，里面含有我们需要的值。
2. 可以看看我之前的那篇文章，最后return的时候，我们是这样子操作的

```java
return new Result<>(ResultEnum.SUCCESS.getCode(), ResultEnum.SUCCESS.getMsg(), user);
```

​		一两句这样写没有什么问题，但是当你服务层壮大之后，你需要书写的就及其多了，而且我们注意到了，code和msg是同一个对象的属性，我们为什么要特地把他拆出来呢，能不能直接返回一个状态，加一个返回值呢。没有什么是加一层解决不了的！我们加一个接口，枚举类实现他就行了。

# 代码

```java
//接口
public interface StatusCode {
    
    int getCode();

    String getMsg();
}
```

```java
//结果集类
public class Result {
    /**编号*/
    private int code;
    /**信息*/
    private String msg;

    /**数据*/
    private Object data;

    /**
     * 无参构造方法(保险)
     */
    public Result() {
        super();
    }

    /**
     * 手动指定状态码
     * @param code :状态码
     * @param msg :信息
     * @param data :数据
     */
    public Result(int code, String msg, Object data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    /**
     * 没有返回值,
     * @param statusCode :状态
     */
    public Result(StatusCode statusCode) {
        this.code = statusCode.getCode();
        this.msg = statusCode.getMsg();
    }


    /**
     * 有返回值
     * @param statusCode :状态
     * @param data :数据
     */
    public Result(StatusCode statusCode,Object data) {
        this.code = statusCode.getCode();
        this.msg = statusCode.getMsg();
        this.data = data;
    }

    public Result(Object data) {
        this.code = ResultEnum.SUCCESS.getCode();
        this.msg = ResultEnum.SUCCESS.getMsg();
        this.data = data;
    }

    @Override
    public String toString() {
        return "Result{" +
                "code=" + code +
                ", msg='" + msg + '\'' +
                ", data=" + data +
                '}';
    }
}
```

```java
//状态枚举
public enum ResultEnum implements StatusCode{
    //自定义
    //通用
    UNKNOWN_ERROR(-1,"未知错误"),
    SUCCESS(200,"成功"),
    UNAUTHORIZED(401,"请先登录"),
    FORBIDDEN(403,"权限不足"),
    RESOURCE_NOT_FOUND(404,"资源未找到"),
    PARAMETER_NOT_VALID(400,"参数不合法"),
    SERVER_INTERNAL_ERROR(500,"服务器正在忙碌中,请稍后试试吧"),


    ;
    /**
     * 编号
     */
    private int code;
    /**
     * 信息
     */
    private String msg;

    ResultEnum(Integer code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public int getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }
}

```

```java
//启动类
public class App {
    public static void main(String[] args) {
        String data = "12345";
        //直接输入数据,默认封装请求成功状态码
        System.out.println(new Result(12345));


        //指定状态码,加数据
        System.out.println(new Result(ResultEnum.CODE_ADD_ERR,data));

        //指定状态码,没有数据
        System.out.println(new Result(ResultEnum.CODE_SELECT_ERR));

        int i = 0;

        System.out.println(new Result((i == 1 ? ResultEnum.CODE_ADD_OK : ResultEnum.CODE_ADD_ERR)));
    }
}
```



















