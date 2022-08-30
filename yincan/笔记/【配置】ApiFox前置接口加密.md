【配置】ApiFox前置接口加密



1. 配置全局变量![image-20220824223513303](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208242235426.png)

![image-20220824223532522](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208242235571.png)

2. 配置脚本

![image-20220824223610781](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208242236861.png)

**前置加密脚本**

```js
var body = pm.request.body.toJSON();
// console.log(body)

var data = body.raw;
// console.log(data)



//生成aes密钥
var aesPassword;


//rsa公钥
var rsaKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDI3hf95L3aMonXCgG926Gt6nwft8RnhM+6UHVieE4N58V0swNvFVU4XRrlNn4o2vU8eZ5z1c8s2AHEl65ck5kiAPjC82nCgWd4j1sdr2Wvz18B+/DT4PLZum4QzwIAviQfafp1qVbC6fYj0BLyDXmeaO5gi3X19U0kIhUPWbzAqQIDAQAB";

// //密文
// postman.setGlobalVariable("encryptStr",JSON.stringify(encryptAES(JSON.stringify(data))))

// //密钥
// postman.setGlobalVariable("encryptKey",JSON.stringify(encrypt(aesPassword,rsaKey)))


// console.log(pm.globals.get("encryptStr"))


var encryptStr_t = JSON.stringify(encryptAES(data));

var encryptKey_t = JSON.stringify(encrypt(aesPassword,rsaKey));
var jsonBody = '{"encryptKey":'+encryptKey_t+',"encryptStr":'+encryptStr_t+'}'
// console.log('11111111'+jsonBody);

var temp = JSON.stringify(jsonBody);
// console.log(temp)
var k = JSON.parse(temp);
// console.log(k)
pm.request.body.update(k)




/* 随机生成密钥 */
// e为目的秘钥长度:为16为
function randomString(e) {    
    e = e || 32;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}

// console.log(randomString(16))


//aes加密密文
function  encryptAES(word){ 

    aesPassword = randomString(16);
    
    pm.environment.set("aesKey", aesPassword);
    // 将随机字符串从UTF8编码解析出原始字符串？？
    const key = CryptoJS.enc.Utf8.parse(aesPassword);
    // 将公钥从UTF8编码解析出原始字符串？？
    const srcs = CryptoJS.enc.Utf8.parse(word);
    // 获得已使用AES加密的公钥
    const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
    // 将密文转化为字符串 并返回
    return encrypted.toString();// base64结果
    // return encrypted.ciphertext.toString()// 二进制结果
}

// rsa加密aes密钥
function encrypt(encryptData, pubk) {
    var jsrsasign = require("jsrsasign");
    pubk = "-----BEGIN PUBLIC KEY-----" + pubk + "-----END PUBLIC KEY-----";
    // 读取解析pem格式的秘钥, 生成秘钥实例 (RSAKey) 

    var pub = jsrsasign.KEYUTIL.getKey(pubk);
    var enc = jsrsasign.KJUR.crypto.Cipher.encrypt(encryptData, pub);

    // console.log("jsrsasign decrypt: " + enc);
    // console.log("jsrsasign hextob64: " + jsrsasign.hextob64(enc));
    return jsrsasign.hextob64(enc);
}
```

**后置解密**

```js

//要看返回的数据看控制台，

var aesKey = "Z6XB<$F9fA5jRT92";

var jsonData = pm.response.json().data;


console.log(decryptAES(aesKey,jsonData))


/** AES解密 */
// aesPassword是用于解密的字符串（秘钥） 与前文用于加密的字符串是同一个 word是密文 对方使用同样的秘钥加密过
 function decryptAES(aesPassword, word){ 

     //有两个密钥，一个为get一个为body

     

    // 将解密字符串转化为原始字符串？？
    var key = CryptoJS.enc.Utf8.parse(aesPassword);
    // 首先将密文 用秘钥进行AES解密 获得明文 此信息即为目的数据
    var decrypt = CryptoJS.AES.decrypt(word, key, { mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
    // 将明文从原始字符串转化为UTF8编码格式 再转为为字符串并返回
    //  decrypt = decrypt.toString().replace('\n','');
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    if(decryptedStr === "") {
       aesPassword =  pm.environment.get("aesKey");
       // 将解密字符串转化为原始字符串？？
          key = CryptoJS.enc.Utf8.parse(aesPassword);
            // 首先将密文 用秘钥进行AES解密 获得明文 此信息即为目的数据
             decrypt = CryptoJS.AES.decrypt(word, key, { mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
         // 将明文从原始字符串转化为UTF8编码格式 再转为为字符串并返回
          // decrypt = decrypt.toString().replace('\n','');
          decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        return decryptedStr.toString();     
    }
    return decryptedStr.toString();


    
    //  var key = CryptoJS.enc.Utf8.parse(aesPassword);

    //  var decrypt = CryptoJS.AES.decrypt(word, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});

    //  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}
```

3. 使用脚本

![image-20220824223740729](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208242237774.png)

4. 发送请求

![image-20220824223808559](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208242238601.png)

5. 查看解密结果

![image-20220824223844745](https://cdn.jsdelivr.net/gh/stopyc/picb@main/202208242238788.png)