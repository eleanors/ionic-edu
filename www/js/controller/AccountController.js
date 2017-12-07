angular.module('starter.controllers')

.controller('AccountController', ['$rootScope', '$scope', 'Config', 'AuthService', function($rootScope, $scope, Config, AuthService) {

    $scope.userData = {
        username: '',
        sex: '',
        avatar: ''
    }

    $scope.auth = {}

    $scope.version = Config.version_code;

    $scope.$on('$ionicView.enter', function () {

        $rootScope.hideTabs = false;
    });

    $scope.initial = function() {
        var data = $scope.auth = AuthService.getAuthInfo();
        $scope.userData.username = data.user_name;
        $scope.userData.sex = data.sex;
        $scope.userData.avatar = data.img_url;
    }
    $scope.initial();
}])


.controller('SettingController', ['$rootScope', '$scope', '$location', 'AuthService', 'Public', function($rootScope, $scope, $location, AuthService, Public) {

    $scope.mobile = '';

    $scope.initial = function() {
        var data = AuthService.getAuthInfo();
        if (data.mobile) {
            $scope.mobile = data.mobile.toString().replace(/(\d{3})\d{5}(\d{3})/, '$1****$2');
        }
    }

    $scope.loginOut = function() {
        var input = '确认退出登录?';
        Public.Modal({
            title: '温馨提示',
            template: input
        }, function(status) {
            if (status) {
                $location.path('login');
                AuthService.removeAuthInfo();
            }
        })
    }

    $scope.initial();
}])


.controller('ModifypwdController', ['$scope', '$timeout', '$state', 'Config', 'Request', 'Public', 'Messages', function($scope, $timeout, $state, Config, Request, Public, Messages) {

    $scope.userData = {
        initialPwd: '',
        newPwd: '',
        reNewpwd: ''
    }

    $scope.isValidPwd = function() {
        var pattern = Config.regExp.isPassword;
        if ($scope.userData.initialPwd=='') {
            return Public.Toast(Messages.emptyPwd);
        } else if ($scope.userData.initialPwd.length < 6) {
            return Public.Toast(Messages.pwdMinLen);
        } else if ($scope.userData.newPwd=='') {
            return Public.Toast(Messages.emptyNewpwd);
        } else if ($scope.userData.newPwd.length < 6) {
            return Public.Toast(Messages.newPwdMinLen);
        } else if ($scope.userData.newPwd.length > 20) {
            return Public.Toast(Messages.pwdMaxLen);
        } else if (!pattern.test($scope.userData.newPwd)) {
            return Public.Toast(Messages.invalidPwd);
        } else if (!$scope.userData.reNewpwd) {
            return Public.Toast(Messages.emptyRepwd);
        } else if ($scope.userData.newPwd !== $scope.userData.reNewpwd) {
            return Public.Toast(Messages.pwdEqual);
        }
        return true;
    }

    $scope.modifyPwd = function() {
        $scope.isValidPwd() && Request.modifyPwd({
            old_password: $scope.userData.initialPwd,
            new_password: $scope.userData.newPwd,
            password: $scope.userData.reNewpwd
        }).then(function(){
            Public.Toast(Messages.resetPwdOk);
            $timeout(function(){
                $state.go('login');
            }, 2e3);
        })
    }
}])


.controller('FeedbackController', ['$scope', '$timeout', '$state', 'Request', 'Public', 'Messages', function($scope, $timeout, $state, Request, Public, Messages) {
    $scope.content = {
        feedbackContent: ''
    }
    $scope.status = false;

    $scope.submit = function() {
        var timer = null;
        if ($scope.status) return;
        if (!$scope.content.feedbackContent) {
            return Public.Toast(Messages.emptyFeedback);
        } else if ($scope.content.feedbackContent.length < 5) {
            return Public.Toast(Messages.feedbackMinLen);
        }
        $scope.status = true;
        Request.feedback({
            content: $scope.content.feedbackContent,
            client_type: 2,
        }).then(function() {
            timer = $timeout(function() {
                $scope.status = false;
                $state.go('main.account');
                $timeout.cancel(timer);
            }, 2e3);
            Public.Toast(Messages.feedbackSuccess);
        },function(){
            $scope.status = false;
        })
    }
}])


.controller('PromisesController', ['$rootScope', '$scope', '$ionicPlatform', '$localStorage', '$location', '$timeout', 'Request', 'Public', 'Messages', '$ionicPopup', 'Picker', 'ExtractImg', '$cordovaDatePicker', function($rootScope, $scope, $ionicPlatform, $localStorage, $location, $timeout, Request, Public, Messages, $ionicPopup, Picker, ExtractImg, $cordovaDatePicker) {

    $scope.auth = {}

    $scope.initial = function() {

        if($localStorage.sex.toString() && $localStorage.img_url
            && $localStorage.user_name && $localStorage.birthday_time){
            $scope.auth = {
                sex: $localStorage.sex,
                img_url: $localStorage.img_url,
                username: $localStorage.user_name,
                birthday_time: $localStorage.birthday_time*1000,
            }
        }else {
            Request.userInfo().then(function(data) {

                data = angular.copy(data.data);
                $scope.auth = {
                    sex: data.sex,
                    img_url: data.img_url,
                    username: data.user_name,
                    birthday_time: data.birthday_time*1000,
                }
                $localStorage.birthday_time = data.birthday_time;
            })
        }
    }

    $scope.initial();

    $scope.modifyAvatar = function() {

        ExtractImg.show(function(result) {
            $rootScope.$broadcast('loading', true);
            $localStorage.avatar = result.url;
            $timeout(function(){
                $location.path('/main/avatar');
            }, 200);
        }, function(result) {
            $ionicLoading.hide();
            Public.Toast(result)
        })
    }

    $scope.modifyName = function() {//Picker.show({buttons:[{text: '取消'},{text: '确定'}]}); return;
        var value = $scope.auth.username;

        var input = '<input type="text" name="" ng-model="auth.username" max-length="12" focus-input/>';

        var update = function(res) {
            Request.updateUserInfo({
                field: 'user_name',
                changed: res
            }).then(function(data) {
                if (data.data) {
                    $scope.auth.user_name = data.data.user_name
                }
            })
        }

        var isValidName = function(value){
            var name = value.toString();
            if(name == ''){
                return Public.Toast(Messages.emptyName);
            }else if(name.length < 2 || name.length > 20){
                return Public.Toast(Messages.NameMinLen);
            }else if(/^\d/.test(name)){
                return Public.Toast(Messages.invalidsName);
            }else if(!/^[\u4E00-\u9FA5\uF900-\uFA2D\da-zA-Z]+$/g.test(name)){
                return Public.Toast(Messages.invalidName);
            }
            return true;
        }

        Public.Modal({
            scope: $scope,
            template: input,
            title: '修改姓名',
            ensure: function(){
                return isValidName($scope.auth.username)
            }
        }, function(res) {
            if (res) {
                return update(res.auth.username);
            }
            $scope.auth.username = value;
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
                    $scope.auth.sex = data.data.sex
                }
            })
        })
    }

    $scope.modifyTime = function() {
        var value = $scope.auth.birthday_time;
        var options = {
            date: new Date(value),
            mode: 'date',
            locale: 'zh-CN',
            minuteInterval: 3000,
            allowOldDates: false,
            allowFutureDates: false,
            doneButtonLabel: '完成',
            cancelButtonLabel: '取消',
            doneButtonColor: '#333333',
            cancelButtonColor: '#333333',
            titleText: '选择您的出生日期',
            androidTheme: window.datePicker.ANDROID_THEMES.THEME_HOLO_LIGHT,
            minDate: ionic.Platform.isAndroid()?'3600000':new Date('1970/01/01 08:00:00'),
            maxDate: ionic.Platform.isAndroid()?'1609344000000':new Date('2020/12/31 00:00:00')
        };

        var update = function(time){
            Request.updateUserInfo({
                field: 'birthday_time',
                changed: time
            }).then(function(data) {
                if (data.data) {
                    $scope.auth.birthday_time = data.data.birthday_time*1e3;
                }
            })
        }

        function onSuccess(date) {
            var time = parseInt(new Date(date).getTime()/1e3);
            if(time > parseInt(new Date().getTime()/1e3)){
                return Public.Toast('选择日期不能大于当前日期')
            }
            update(time+3e4);
        }

        function onError() { // Android only
            $scope.auth.birthday_time = value;
        }

        document.addEventListener("deviceready", function () {

            $cordovaDatePicker.show(options).then(function(date){
                if(date){
                    onSuccess(date)
                }else{
                    onError()
                }
            });

        }, false);
    }
}])


.controller('AvatarController', ['$rootScope', '$scope', '$localStorage', '$location', '$ionicLoading', 'Request', 'Public', function($rootScope, $scope, $localStorage, $location, $ionicLoading, Request, Public) {
    $scope.status = false;
    $scope.image = '';
    $scope.cropper = {
        cropper: null
    };

    $scope.initial = function() {
        $scope.image = $localStorage.avatar;
    }

    $scope.save = ionic.debounce(function() {
        var canvasData = null;
        var imgUrl = '';
        var url = '';

        $rootScope.$broadcast('loading', [true, '正在更新,请稍候...']);
        canvasData = $scope.cropper.cropper.getCroppedCanvas({ width: 400, height: 400 });

        if(canvasData){
            imgUrl = canvasData.toDataURL('image/jpeg');
            url = imgUrl.replace('data:image/jpeg;base64,', '');
            if(!url) return;
        }
        var source = Request.UploadImgBase64({
            file : url,
            file_ext : 'jpg'
        })

        source.then(function(result){
            url = result.url;
            Request.updateUserInfo({
                changed: url,
                field: 'img_url'
            }).then(function(data) {
                $location.path('/main/promises');
            }, function(){
                Public.Toast('更新失败, 请重新尝试');
            })
        }, function(){
            //$ionicLoading.hide();
        })
    }, 2000, true)

    $scope.initial();
}])

.directive('cropperImages', [function() {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            path: '=',
            cropper: '='
        },
        template: '<img />',
        link: function(scope, elem, attr) {
            elem[0].src = scope.path;
            scope.cropper = new Cropper(elem[0], {
                viewMode: 2,
                aspectRatio: 1 / 1,
                zoomable: false,
                zoomOnTouch: false,
                minCropBoxWidth: 100,
                minCropBoxHeight: 100,
            });
        }
    }
}])


.constant('Messages', {
    pwdMaxLen: '密码不能超过20位',
    pwdMinLen: '密码至少大于等于6位',
    newPwdMinLen: '新密码至少大于等于6位',
    emptyPwd: '原密码不能为空',
    emptyNewpwd: '新密码不能为空',
    emptyRepwd: '确认密码不能为空',
    invalidPwd: '密码仅由数字或字母组成',
    pwdEqual: '两次输入密码不一致',
    resetPwdOk: '密码修改成功',

    emptyName: '姓名不能为空',
    invalidName: '姓名包含特殊字符',
    invalidsName: '姓名不能以数字开头',
    NameMinLen: '姓名必须2-12位字符',

    emptyFeedback: '您还没填写反馈内容',
    feedbackMinLen: '反馈内容最少五位字符',
    feedbackSuccess: '感谢您的反馈, 我们会及时处理'
})


.directive('maxLength', [function(){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attr, ctrl){
            scope.$watch(attr.ngModel, function(nv, ov){
                var selectionStart = element[0].selectionStart;

                if(!angular.isUndefined(nv) && nv !==''){
                    if ((nv+'').toString().length >= attr.maxLength) {
                        var value = (nv+'').toString().substr(0, attr.maxLength);
                        element[0].value = value;
                        element[0].selectionStart = element[0].selectionEnd = selectionStart;
                        ctrl.$setViewValue(value);
                    }
                }
            })
        }
    }
}])



.factory('Picker', ['$rootScope', '$compile', '$animate', '$timeout', '$ionicPlatform', '$ionicBody', function($rootScope, $compile, $animate, $timeout, $ionicPlatform, $ionicBody) {

    var noop = angular.noop;
    return { show: Picker };
    function Picker(option) {
        var options = {
            cancel: noop,
            buttonClicked: noop,
            buttons: []
        }
        var scope = $rootScope.$new(true);
        angular.extend(scope, options, option);
        var element = scope.element = $compile('<date-picker><div></div></date-picker>')(scope);

        var pickerWrap = angular.element(element[0].querySelector('.date-picker-wrapper'));
        scope.showPicker = function(done) {
            if(scope.removed) return;
            $ionicBody.append(element).addClass('date-picker-open');
            $animate.addClass(element, 'active').then(function(){
                if(scope.removed) return;
                (done || noop)();
            })
            $timeout(function(){
                if(scope.removed) return;
                pickerWrap.addClass('date-picker-up');
            }, 60, false);
        }

        scope.removePicker = function(done){
            if(scope.removed) return;
            scope.removed = true;

            pickerWrap.removeClass('date-picker-up');
            $timeout(function(){
                $ionicBody.removeClass('date-picker-open');
            }, 400);

            $animate.removeClass(element, 'active').then(function(){
                scope.$destroy();
                element.remove();
                pickerWrap = scope.cancel.$scope = null;
                (done || noop)(options.buttons)
            })
        }

        scope.cancel = function() {
            scope.removePicker(options.cancel);
        }

        scope.showPicker();
    }
}])


.directive('datePicker', [function(){
    return {
        restrict: 'AE',
        replace: true,
        scope: true,
        transclude: true,
        link: function(scope, element, attrs){
            var backdropHandle = function(evt){
                if(evt.target == element[0]){
                    scope.cancel();
                    scope.$apply();
                }
            }

            scope.$on('$destroy', function(){
                element.remove();
            })

            element.bind('click', backdropHandle)
        },
        template: '<div class="date-picker-backdrop"><div class="date-picker-wrapper">'+

        '<div class="date-picker-btn"><span ng-repeat="btn in buttons" ng-bind-html="btn.text"></span></div>'+
        '<div class="date-picker-content" ng-transclude></div>'+
        '</div></div>'
    }
}])
