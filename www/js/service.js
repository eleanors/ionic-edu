angular.module('starter.services', [])

    .factory('requestInterceptor', function($rootScope, $q) {
        return {
            request: function(config) {
                if (!$rootScope.count) {
                    $rootScope.count = 0;
                }

                if (config.url.indexOf('.html')<0 && !(config.params && config.params.unloading)) {
                    $rootScope.count++;
                    $rootScope.$broadcast('loading', true);
                }

                return config;
            },
            response: function(response) {
                if (response.config.url.indexOf('.html')<0 && !(response.config.params && response.config.params.unloading)) {
                    $rootScope.count--;
                }

                if ($rootScope.count <= 0) {
                    $rootScope.$broadcast('loading', false);
                }
                if (response.data && angular.isObject(response.data)) {
                    if (response.data.err_code === 0) {
                        return $q.resolve(response.data);
                    } else {
                        return $q.reject(response.data);
                    }
                }
                return response;
            },
            responseError: function(response) {
                if (response.config.url.indexOf('.html')<0 && !(response.config.params && response.config.params.unloading)) {
                    $rootScope.count--;
                }

                if ($rootScope.count <= 0 && !$rootScope.uploading) {
                    $rootScope.$broadcast('loading', false);
                }
                return $q.reject(response);
            }
        };
    })

     .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('requestInterceptor');
        var form_encodes_support = ['post', 'put'];
        var param = function(obj) {
            var name, value, fullSubName, subName, subValue, innerObj, i, query = "";
            for (name in obj)
                if (value = obj[name], value instanceof Array)
                    for (i = 0; i < value.length; ++i) subValue = value[i],
                        fullSubName = name + "[" + i + "]",
                        innerObj = {},
                        innerObj[fullSubName] = subValue,
                        query += param(innerObj) + "&";
                else if (value instanceof Object)
                for (subName in value) subValue = value[subName],
                    fullSubName = name + "[" + subName + "]",
                    innerObj = {},
                    innerObj[fullSubName] = subValue,
                    query += param(innerObj) + "&";
            else void 0 !== value && null !== value && (query += encodeURIComponent(name) + "=" + encodeURIComponent(value) + "&");
            return query.length ? query.substr(0, query.length - 1) : query
        };
        angular.forEach(form_encodes_support, function(method) {
            $httpProvider.defaults.headers[method]["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8"
        });
        $httpProvider.defaults.transformRequest = [function(data) {
            return angular.isObject(data) && "[object File]" !== String(data) ? param(data) : data
        }];
    }]);

