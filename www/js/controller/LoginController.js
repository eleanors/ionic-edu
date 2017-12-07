angular.module('starter.controllers')

.controller('LoginController', ['$rootScope', '$scope', '$localStorage', '$location', '$ionicPlatform', '$timeout', 'Public', 'Config', 'Request', 'Config', function($rootScope, $scope, $localStorage, $location, $ionicPlatform, $timeout, Public, Config, Request, Config) {

    $scope.user = {
        mobile: '', // 18700701169  000000
        password: '',
        device_id: '',
        client_type: 1,
        customer_type: 2
    };

    $scope.login = ionic.debounce(function() {
        var params = null;
        if (!Config.regExp.isMobile.test($scope.user.mobile)) {
            return Public.Toast('请输入正确的手机号码');
        }
        if ($scope.user.password == '') {
            return Public.Toast('请输入登录密码');
        }
        params = {
            mobile: $scope.user.mobile,
            password: $scope.user.password,
            customer_type: $scope.user.customer_type,
            device_id: $rootScope.device_id,
            client_type: ionic.Platform.isAndroid() ? 1 : 3,
            info: JSON.stringify($rootScope.info)
        };
        Request.login(params).then(function(data) {
            // todo.. 验证信息提示
            $timeout(function(){
                $location.path('/main/grade');
            }, 500)
        })
    }, 1000, true)

    $scope.loginHandle = function(event){
        var keycode = event.keyCode;
        if(keycode == 13){
            event.preventDefault();
            $scope.login();
        }
    }

    $scope.register = function() {
        $location.path('/register');
    }

    $scope.forgetPwd = function() {
        $location.path('/forget');
    }

}])


.controller('RegisterController', ['$rootScope', '$scope', '$ionicPlatform', '$state', '$interval', '$q', 'AuthService', 'Message', 'Request', 'Public', 'Config', function($rootScope, $scope, $ionicPlatform, $state, $interval, $q, AuthService, Message, Request, Public, Config) {

    $scope.sendStatus = false;
    $scope.btnText = '获取验证码';

    $scope.registerData = {
        mobile: '',
        code: '',
        password: ''
    }

    $scope.valid = {
        mobile: '',
        pwd: ''
    }

    $scope.$watch('registerData.mobile', function(nv, ov) {
        if (nv === ov) return;
        $scope.valid.mobile = Config.regExp.isMobile.test($scope.registerData.mobile)
    })

    $scope.$watch('registerData.password', function(nv, ov) {
        if (nv === ov) return;
        $scope.valid.pwd = Config.regExp.isPassword.test($scope.registerData.password)
    })

    $scope.isValidMobile = function() {
        if ($scope.registerData.mobile == '') {
            return Public.Toast(Message.emptyMobile);
        } else if (!$scope.valid.mobile) {
            return Public.Toast(Message.invalidMobile);
        }
        if ($scope.registerData.code == '') {
            return Public.Toast(Message.emptyCode);
        }
        return true;
    }

    $scope.isValidCode = function() {
        var pattern = /^[0-9]{6}$/;
        if ($scope.registerData.code == '') {
            return Public.Toast(Message.emptyCode);
        }
        if (!pattern.test($scope.registerData.code)) {
            return Public.Toast(Message.invalidCode);
        }
        return true;
    }

    $scope.isValidPwd = function() {
        if ($scope.registerData.password == '') {
            return Public.Toast(Message.emptyPwd);
        } else if ($scope.registerData.password.length < 6) {
            return Public.Toast(Message.pwdMinLen);
        } else if ($scope.registerData.password.length > 20) {
            return Public.Toast(Message.pwdMaxLen);
        } else if (!$scope.valid.pwd) {
            return Public.Toast(Message.invalidPwd);
        }
        return true;
    }

    $scope.checkMobile = function() {
        var defer = $q.defer();
        if ($scope.registerData.mobile == '') {
            Public.Toast(Message.emptyMobile);
            defer.reject();
        } else if (!$scope.valid.mobile) {
            Public.Toast(Message.invalidMobile);
            defer.reject();
        } else {
            Request.checkMobile({
                mobile: $scope.registerData.mobile
            }).then(function(data) {
                if (data.data.status) {
                    defer.reject();
                    Public.Toast('该手机号已被注册');
                } else {
                    defer.resolve();
                }
            })
        }
        return defer.promise;
    }

    $scope.sendCode = function() {
        var mobile = $scope.registerData.mobile;
        var start = function() {
            var time = 60;
            var interval = $interval(function() {
                time--;
                time = time < 10 ? '0' + time : time;
                $scope.btnText = '重新获取('+ time +'s)';
                time < 1 && ($interval.cancel(interval), $scope.sendStatus = false, $scope.btnText = '点击重新获取');
            }, 1e3)
        }
        $scope.sendStatus || $scope.checkMobile().then(function() {
            $scope.sendStatus = true;
            Request.sendMobileCaptcha({
                mobile: mobile
            }).then(function(data) {
                start();
                Public.Toast('验证码已发送');
            })
        })
    }

    $scope.signup = ionic.debounce(function() {
        var params = {
            mobile: $scope.registerData.mobile,
            code: $scope.registerData.code,
            password: $scope.registerData.password,
            user_type: 2,
            customer_type: 2,
            client_type: ionic.Platform.isAndroid() ? 1 : 2,
            device_id: $rootScope.device_id,
            info: JSON.stringify($rootScope.info)
        }

        if ($scope.isValidMobile() && $scope.isValidCode() && $scope.isValidPwd()) {
            Request.register(params).then(function(data) {
                angular.extend(data.data, {
                    sex: 0,
                    img_url: '',
                    mobile: $scope.registerData.mobile,
                    user_name: $scope.registerData.mobile
                })
                AuthService.setAuthInfo(data);
                $state.go('registers');
            })
        }
    }, 1000, true)
}])



.controller('RegistersController', ['$scope', '$state', '$ionicPopup', 'Request', 'Config', 'Public', 'Message', function($scope, $state, $ionicPopup, Request, Config, Public, Message) {

    $scope.userData = {
        sex: '',
        name: ''
    }

    $scope.modifyName = function() {
        var value = $scope.userData.name;

        var input = '<input type="text" name="" placeholder="请输入学生的姓名" ng-model="userData.name" max-length="12" focus-input/>';

        var update = function(res) {
            Request.updateUserInfo({
                field: 'user_name',
                changed: res
            }).then(function(data) {
                if (data.data) {
                    $scope.userData.name = data.data.user_name
                }
            })
        }

        var isValidName = function(value){
            var name = value.toString();
            if(name == ''){
                return Public.Toast(Message.emptyName);
            }else if(name.length < 2 || name.length > 20){
                return Public.Toast(Message.NameMinLen);
            }else if(/^\d/.test(name)){
                return Public.Toast(Message.invalidsName);
            }else if(!/^[\u4E00-\u9FA5\uF900-\uFA2D\da-zA-Z]+$/g.test(name)){
                return Public.Toast(Message.invalidName);
            }
            return true;
        }

        Public.Modal({
            scope: $scope,
            template: input,
            title: '您的姓名',
            ensure: function(){
                return isValidName($scope.userData.name)
            }
        }, function(res) {
            if (res) {

                return update(res.userData.name);
            }else{
                $scope.userData.name = value
            }
        })
    }

    $scope.modifySex = function() {
        Public.ActionSheet({
            buttonLabels: ['男', '女']
        }, function(status) {
            Request.updateUserInfo({
                field: 'sex',
                changed: status
            }).then(function(data) {
                if (data.data) {
                    $scope.userData.sex = data.data.sex
                }
            })
        })
    }

    $scope.finish = function() {
        var input = '您还没有填写姓名'
        if($scope.userData.name == ''){
            return Public.Toast(input);
        }
        $state.go('main.grade');
    }
}])



.controller('ForgetPwdController', ['$scope', '$state', '$interval', '$state', '$q', '$timeout', 'Message', 'Request', 'Public', 'Config', function($scope, $state, $interval, $state, $q, $timeout, Message, Request, Public, Config) {

    $scope.sendStatus = false;
    $scope.btnText = '获取验证码';

    $scope.forgetDate = {
        mobile: '',
        code: '',
        password: '',
        passwords: ''
    }

    $scope.valid = {
        mobile: '',
        pwd: ''
    }

    $scope.$watch('forgetDate.mobile', function(nv, ov) {
        if (nv === ov) return;
        $scope.valid.mobile = Config.regExp.isMobile.test($scope.forgetDate.mobile)
    })

    $scope.$watch('forgetDate.password', function(nv, ov) {
        if (nv === ov) return;
        $scope.valid.pwd = Config.regExp.isPassword.test($scope.forgetDate.password)
    })

    $scope.isValidMobile = function() {
        if ($scope.forgetDate.mobile == '') {
            return Public.Toast(Message.emptyMobile);
        } else if (!$scope.valid.mobile) {
            return Public.Toast(Message.invalidMobile);
        }
        if ($scope.forgetDate.code == '') {
            return Public.Toast(Message.emptyCode);
        }
        return true;
    }

    $scope.isValidCode = function() {
        var pattern = /^[0-9]{6}$/;
        if ($scope.forgetDate.code == '') {
            return Public.Toast(Message.emptyCode);
        }
        if (!pattern.test($scope.forgetDate.code)) {
            return Public.Toast(Message.invalidCode);
        }
        return true;
    }

    $scope.isValidPwd = function() {
        if ($scope.forgetDate.password == '') {
            return Public.Toast(Message.emptyPwd);
        } else if ($scope.forgetDate.password.length < 6) {
            return Public.Toast(Message.pwdMinLen);
        } else if ($scope.forgetDate.password.length > 20) {
            return Public.Toast(Message.pwdMaxLen);
        } else if (!$scope.valid.pwd) {
            return Public.Toast(Message.invalidPwd);
        } else if ($scope.forgetDate.passwords == '') {
            return Public.Toast(Message.emptyPwds);
        } else if ($scope.forgetDate.password !== $scope.forgetDate.passwords) {
            return Public.Toast(Message.pwdEqual);
        }
        return true;
    }

    $scope.checkMobile = function() { // 验证状态与注册相反
        var defer = $q.defer();
        if ($scope.forgetDate.mobile == '') {
            Public.Toast(Message.emptyMobile);
            defer.reject();
        } else if (!$scope.valid.mobile) {
            Public.Toast(Message.invalidMobile);
            defer.reject();
        } else {
            Request.checkMobile({
                mobile: $scope.forgetDate.mobile
            }).then(function(data) {
                if (data.data.status) {
                    defer.resolve();
                } else {
                    defer.reject();
                    Public.Toast('该手机号还未注册');
                }
            })
        }
        return defer.promise;
    }

    $scope.sendCode = function() {
        var mobile = $scope.forgetDate.mobile;
        var start = function() {
            var time = 60;
            var interval = $interval(function() {
                time--;
                time = time < 10 ? '0' + time : time;
                $scope.btnText = '重新获取('+ time +'s)';
                time < 1 && ($interval.cancel(interval), $scope.sendStatus = false, $scope.btnText = '点击重新获取');
            }, 1e3)
        }
        $scope.sendStatus || $scope.checkMobile().then(function() {
            $scope.sendStatus = true;
            Request.sendMobileCaptcha({
                mobile: mobile
            }).then(function(data) {
                start();
                Public.Toast('验证码已发送');
            })
        })
    }

    $scope.resetPwd = ionic.debounce(function() {
        if ($scope.isValidMobile() && $scope.isValidCode() && $scope.isValidPwd()) {
            Request.resetPwd({
                mobile: $scope.forgetDate.mobile,
                code: $scope.forgetDate.code,
                password: $scope.forgetDate.password,
                new_password: $scope.forgetDate.passwords
            }).then(function() {
                Public.Toast(Message.resetPwdOk);
                $timeout(function() {
                    $state.go('login');
                }, 2e3);
            })
        }
    }, 1e3, true)
}])


.directive('downTime', ['$interval', function($interval) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            callback: '&',
            time: '@'
        },
        link: function(scope, element, attrs) {
            scope.time = 60;
            scope.interval = null;
            scope.btnText = '获取验证码';
            scope.start = function() {
                scope.interval || scope.callback && scope.callback();
                scope.interval = scope.interval || $interval(function() {
                        scope.time = scope.time - 1;
                        scope.btnText = scope.time + 's后重新获取';
                        if (scope.time < 1) {
                            $interval.cancel(scope.interval);
                            scope.interval = null;
                            scope.btnText = '重新获取';
                            scope.time = 60;
                        }
                    }, 1e3)
            }
        },
        template: '<span class="code" ng-click="start()">{{btnText}}</span>'
    }
}])


.constant('Message', {
    invalidMobile: '手机号码格式有误',
    emptyMobile: '手机号不可以为空',

    pwdMaxLen: '密码不能超过20位',
    pwdMinLen: '密码至少大于等于6位',
    emptyPwd: '密码不能为空',
    emptyPwds: '确认密码不能为空',
    invalidPwd: '密码仅由数字或字母组成',
    invalidCode: '请输入正确的验证码',
    emptyCode: '验证码不能为空',
    pwdEqual: '两次输入密码不一致',
    resetPwdOk: '密码修改成功',

    emptyName: '姓名不能为空',
    invalidName: '姓名包含特殊字符',
    invalidsName: '姓名不能以数字开头',
    NameMinLen: '姓名必须2-12位字符'
})
