/*
* @Author: cd
* @Date:   2017-08-07 23:03:41
* @Last Modified by:   cd
* @Last Modified time: 2017-08-10 15:04:23
* author:胡俊杰
*/

'use strict';


//1.cookie的封装HJJ100001
// 对cookie的封装，采取getter、setter方式
// 
(function(global) {
    //获取cookie对象，以对象表示
    function getCookiesObj() {
        var cookies = {};
        if (document.cookie) {
            var objs = document.cookie.split('; ');
            for (var i in objs) {
                var index = objs[i].indexOf('='),
                    name = objs[i].substr(0, index),
                    value = objs[i].substr(index + 1, objs[i].length);
                cookies[name] = value;
            }
        }
        return cookies;
    }
    //设置cookie
    function set(name, value, opts) {
        //opts maxAge, path, domain, secure  max-age用秒来设置cookie的生存期
        if (name && value) {
            var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
            //可选参数
            if (opts) {
                if (opts.maxAge) {
                    cookie += '; max-age=' + opts.maxAge;
                }
                if (opts.path) {
                    cookie += '; path=' + opts.path;
                }
                if (opts.domain) {
                    cookie += '; domain=' + opts.domain;
                }
                if (opts.secure) {
                    cookie += '; secure';
                }
            }
            document.cookie = cookie;
            return cookie;
        } else {
            return '';
        }
    }
    //获取cookie
    function get(name) {
        return decodeURIComponent(getCookiesObj()[name]) || null;
    }
    //清除某个cookie
    function remove(name) {
        if (getCookiesObj()[name]) {
            document.cookie = name + '=; max-age=0';
        }
    }
    //清除所有cookie
    function clear() {
        var cookies = getCookiesObj();
        for (var key in cookies) {
            document.cookie = key + '=; max-age=0';
        }
    }
    //获取所有cookies
    function getCookies(name) {
        return getCookiesObj();
    }
    //解决冲突
    function noConflict(name) {
        if (name && typeof name === 'string') {
            if (name && window['cookie']) {
                window[name] = window['cookie'];
                delete window['cookie'];
                return window[name];
            }
        } else {
            return window['cookie'];
            delete window['cookie'];
        }
    }
    global['cookie'] = {
        'getCookies': getCookies,
        'set': set,
        'get': get,
        'remove': remove,
        'clear': clear,
        'noConflict': noConflict
    };
})(window);

//2.维数组变为真数组（HJJ100002）
function pseudoArrayToArray(pseudoArray){
		return Array.prototype.slice.call(pseudoArray);
	}
//3.获取Url后面的参数（HJJ100003）
(function(global) {
    //获取单个参数
    function get(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");  
        var r = window.location.search.substr(1).match(reg);  //获取url中"?"符后的字符串并正则匹配
        var context = "";  
        if (r != null)  
            context = r[2];  
        reg = null;  
        r = null;  
        return context == null || context == "" || context == "undefined" ? "" : context;
    }
    // 获取全部参数
    function getAll(){
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for(var i = 0; i < strs.length; i ++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    }
    global['getRequestString'] = {
        'get': get,
        'getAll':getAll
    };
})(window);

// 4.封装ajax函数（HJJ100004）
/* 
 * @param {string}opt.type http连接的方式，包括POST和GET两种方式
 * @param {string}opt.url 发送请求的url
 * @param {boolean}opt.async 是否为异步请求，true为异步的，false为同步的
 * @param {object}opt.data 发送的参数，格式为对象类型
 * @param {function}opt.success ajax发送并接收成功调用的回调函数
 *  1 ajax({
 2      method: 'POST',
 3      url: 'test.php',
 4      data: {
 5          name1: 'value1',
 6          name2: 'value2'
 7      },
 8      success: function (response) {
 9          console.log(response)；
10      },
        error:function(){},
        timeout:1000//timeout调用的是error函数
11 });
 * 
 */
    function ajax(opt) {
        opt = opt || {};
        opt.method = (opt.method==null?"GET":opt.method.toUpperCase());
        opt.url = opt.url || '';
        opt.async = opt.async || true;
        opt.data = opt.data || null;
        opt.success = opt.success || function() {};
        opt.error = opt.error||function(){};
        opt.timeout = parseFloat(opt.timeout)>0?parseFloat(opt.timeout):0;
        var xmlHttp = null;
        if (XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        }
        else {
            xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
        }var params = [];
        for (var key in opt.data){
            params.push(key + '=' + opt.data[key]);
        }
        var postData = params.join('&');
        if (opt.method.toUpperCase() === 'POST') {
            xmlHttp.open(opt.method, opt.url, opt.async);
            xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
            xmlHttp.send(postData);
        }
        else if (opt.method.toUpperCase() === 'GET') {
            xmlHttp.open(opt.method, opt.url + '?' + postData, opt.async);
            xmlHttp.send(null);
        } 
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                opt.success(xmlHttp.responseText);
            }
        };
        if(opt.timeout!=0){
            setTimeout(function(){
                opt.success = null;
                opt.error();
            },opt.timeout)
        }
    }
// 5.封装JSONP函数（HJJ100005）
/*
 *调用方式
 *JSONP(url,{  
            data:{  
                id:1  
            },  
            callback:function(data){console.log(data)}, 
            error:function(){....} 
            timeout:10000  
        });
*/
function JSONP(url,config){  
    var data = config.data || [];  
    var paraArr=[],paraString='';//get请求的参数。  
    var urlArr;  
    var callbackName;//每个回调函数一个名字。按时间戳。  
    var script,head;//要生成script标签。head标签。  
    var supportLoad;//是否支持 onload。是针对IE的兼容处理。  
    var onEvent;//onload或onreadystatechange事件。  
    var timeout = config.timeout || 0;//超时功能。  
  
    for(var i in data){  
        if(data.hasOwnProperty(i)){  
            paraArr.push(encodeURIComponent(i) + "=" +encodeURIComponent(data[i]));  
        }  
    }  
  
    urlArr = url.split("?");//链接中原有的参数。  
    if(urlArr.length>1){  
        paraArr.push(urlArr[1]);  
    }  
  
    callbackName = 'callback'+new Date().getTime();  
    paraArr.push('callback='+callbackName);  
    paraString = paraArr.join("&");  
    url = urlArr[0] + "?"+ paraString;  
  
    script = document.createElement("script");  
    script.loaded = false;//为了实现IE下的onerror做的处理。JSONP的回调函数总是在script的onload事件（IE为onreadystatechange）之前就被调用了。因此我们在正向回调执行之时，为script标签添加一个属性，然后待到onload发生时，再检测有没有这个属性就可以判定是否请求成功，没有成功当然就调用我们的error。  
  
    //将回调函数添加到全局。  
    window[callbackName] = function(arg){  
        var callback = config.callback;  
        callback(arg);  
        script.loaded = true;  
    }  
  
    head = document.getElementsByTagName("head")[0];  
    head.insertBefore(script, head.firstChild) //chrome下第二个参数不能为null  
    script.src = url;  
  
    supportLoad = "onload" in script;  
    onEvent = supportLoad ? "onload" : "onreadystatechange";  
  
    script[onEvent] = function(){  
  
        if(script.readyState && script.readyState !="loaded"){  
            return;  
        }  
        if(script.readyState == 'loaded' && script.loaded == false){  
            script.onerror();  
            return;  
        }  
        //删除节点。  
        (script.parentNode && script.parentNode.removeChild(script))&& (head.removeNode && head.removeNode(this));    
        script = script[onEvent] = script.onerror = window[callbackName] = null;  
  
    }  
  
    script.onerror = function(){  
        if(window[callbackName] == null){  
            console.log("请求超时，请重试！");  
        }  
        config.error && config.error();//如果有专门的error方法的话，就调用。  
        (script.parentNode && script.parentNode.removeChild(script))&& (head.removeNode && head.removeNode(this));    
        script = script[onEvent] = script.onerror = window[callbackName] = null;  
    }  
  
    if(timeout!= 0){  
        setTimeout(function() {  
            if(script && script.loaded == false){  
                window[callbackName] = null;//超时，且未加载结束，注销函数  
                script.onerror();                 
            }  
        }, timeout);  
    }  
  
}
// 6.深层copy（HJJ100006）
function deepCopy(p, c) {
　　　　var c = c || {};
　　　　for (var i in p) {
　　　　　　if (p[i] !== null&&typeof p[i] === 'object') {
　　　　　　　　c[i] = (p[i].constructor === Array) ? [] : {};
　　　　　　　　deepCopy(p[i], c[i]);
　　　　　　} else {
　　　　　　　　　c[i] = p[i];
　　　　　　}
　　　　}
　　　　return c;
　　}
// 7.完美继承（HJJ100007）
function Child(x,y){
    Parent.apply(this, arguments);
　　this.x = x;
　　this.y = y;
}
function extend(Child, Parent) {

　　　　var F = function(){};
　　　　F.prototype = Parent.prototype;
　　　　Child.prototype = new F();
　　　　Child.prototype.constructor = Child;
　　　　Child.uber = Parent.prototype;
　　}

// 8.继承数组下方法
Array.prototype.slice.call(document.getElementsByTagName("*"));