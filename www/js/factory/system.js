angular.module('starter.factories',[])

/**
 * [GET POST请求 错误处理]
 * @param  {[type]} $q        [description]
 * @param  {[type]} $http     [description]
 * @param  {Object} $timeout) {                   var error_info [description]
 * @return {[type]}           [description]
 */
.factory('Reference', ['$q', '$http', '$timeout', '$state', 'Config', 'AuthService', 'Public', function($q, $http, $timeout, $state, Config, AuthService, Public) {
    // 请求数据地址配置
    var evn = Config.evn;

    var h = evn ? Config.host : Config.testHost;

    var error_info = Config.error;

    var handleBaseError = function(error) {
        // todo...接入提示 toast
        angular.forEach(error_info, function(msg, e) {
            if (e == error) {
                Public.Toast(msg);
            }
            if (error == 3001 || error == 3002) {
                $state.go('login');
                AuthService.removeAuthInfo();
            }
        })
    }

    var handleError = function(error, func) {
        if (error.err_code) {
            func && angular.isFunction(func) && func.call(null, error) !== true && handleBaseError(error.err_code)
        } else {
            handleBaseError(error.status)
        }
    }

    var post = function(options) {
        var defer = $q.defer();
        var url = options.url;
        var params = options.params;
        angular.extend(params, {
            access_token: AuthService.getToken()
        });
        $http({
            method: 'post',
            data: params,
            url: h + url,
            timeout: 15e3
        }).then(function(data) {
            defer.resolve(data);
        }, function(e) {
            handleError(e, angular.noop)
            defer.reject(e);
        });
        return defer.promise;
    }

    var get = function(options) {
        var defer = $q.defer();
        var url = options.url;
        var params = options.params;
        angular.extend(params, {
            access_token: AuthService.getToken()
        });
        $http({
            method: 'get',
            params: params,
            url: h + url,
            timeout: 15e3
        }).then(function(data) {
            defer.resolve(data);
        }, function(e) {
            handleError(e, angular.noop)
            defer.reject(e);
        });
        return defer.promise;
    }
    return {
        get: get,
        post: post
    }
}])

/**
 * [cookie factory]
 * @param  {[type]} )   {  var cookies [description]
 * @param  {[type]} null [description]
 * @return {[type]}      [description]
 */
.factory('Cookies', [function() {
    var cookies = function(name, value, options) {
        if ("undefined" == typeof value) {
            var cookieValue = null;
            if (document.cookie && "" != document.cookie)
                for (var cookies = document.cookie.split(";"), i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i].replace(/(^\s*)|(\s*$)/g, '');
                    if (cookie.substring(0, name.length + 1) == name + "=") {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break
                    }
                }
            return cookieValue
        }
        options = options || {},
        null === value && (value = "", options.expires = -1);
        var expires = "";
        if (options.expires && ("number" == typeof options.expires || options.expires.toUTCString)) {
            var date;
            "number" == typeof options.expires ? (date = new Date, date.setTime(date.getTime() + 24 * options.expires * 60 * 60 * 1e3)) : date = options.expires,
                expires = "; expires=" + date.toUTCString()
        }
        var path = options.path ? "; path=" + options.path : "",
            domain = options.domain ? "; domain=" + options.domain : "",
            secure = options.secure ? "; secure" : "";
        document.cookie = [name, "=", encodeURIComponent(value), expires, path, domain, secure].join("")
    };
    return {
        get: function(name) {
            return cookies(name)
        },
        remove: function(name) {
            return cookies(name, null)
        },
        set: function(name, value, opt) {
            return cookies(name, value, opt || {
                    expires: 1,
                    path: "/"
                })
        }
    }
}])

/**
 * [登录认证信息]
 * @param  {[type]} Config    [description]
 * @param  {[type]} Reference [description]
 * @return {[type]}           [description]
 */
.factory('AuthService', ['Config', 'Cookies', '$localStorage', function(Config, Cookies, $localStorage) {
    return {
        authInfo: new Object(),
        cookie_key: 'cloud',
        setAuthInfo: function(data) {
            $localStorage.$default(this.authInfo);
            if (data && data.data) {
                var limit_time = 30;
                angular.forEach(data.data, function(value, key) {
                    this.authInfo[key] = value;
                }, this)
                if ($localStorage.$supported()) {
                    $localStorage.$reset(this.authInfo);
                } else {
                    Cookies.set(this.cookie_key, JSON.stringify(this.authInfo), {
                        expires: limit_time
                    })
                }
            }
        },

        getAuthInfo: function() {
            return $localStorage;
        },

        removeAuthInfo: function() {
            $localStorage.$reset();
        },

        updateAuthInfo: function(data) {
            if (data && angular.isObject(data)) {
                angular.forEach(data.data, function(value, key) {
                    $localStorage[key] = value;
                }, this)
            }
        },

        getToken: function() {
            return $localStorage.access_token || '';
        },

        isLogin: function() {
            return !!$localStorage.access_token || '';
        }
    }
}])
