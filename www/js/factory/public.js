angular.module('starter.factories')

//这里写公共方法
.factory('Public', function($cordovaToast, $ionicActionSheet, $ionicPopup, $cordovaActionSheet, $timeout, $rootScope, $cordovaSplashscreen, $ionicPlatform, $interval, $ionicLoading, $sce) {
    return {
        Toast: function(msg) {
            if (ionic.Platform.navigator.platform == 'Win32') {
                console.log(msg);
                return;
            }
            $cordovaToast.showWithOptions({
                message: msg,
                duration: "short",
                position: "bottom",
                addPixelsY: ionic.Platform.isAndroid() ? -160 : -80
            });
        },

        ToastTop: function(msg) {
            if (ionic.Platform.navigator.platform == 'Win32') {
                console.log(msg);
                return;
            }
            $cordovaToast.showWithOptions({
                message: msg,
                duration: "short",
                position: "center",
                addPixelsY: ionic.Platform.isAndroid() ? -160 : -50
            });
        },

        formatSeconds: function(s) {
            var t = '';
            if (s > -1) {
                var min = Math.floor(s / 60) % 60;
                var sec = s % 60;

                if (min < 10) { t += "0"; }
                t += min + ":";
                if (sec < 10) { t += "0"; }
                t += sec;
            }
            return t;
        },

        formatTime: function(time, format) {
            time = new Date(time);
            format = format || 'MM-dd-hh:mm'
            var args = {
                "M+": time.getMonth() + 1,
                "d+": time.getDate(),
                "h+": time.getHours(),
                "m+": time.getMinutes(),
                "s+": time.getSeconds(),
            };
            if (/(y+)/.test(format))
                format = format.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var i in args) {
                var n = args[i];
                if (new RegExp("(" + i + ")").test(format))
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
            }
            return format;
        },
        TestType: function(test_type) {
            switch (test_type) {
                case 1:
                    test_type = '单选题';
                    break;
                case 2:
                    test_type = '多选题';
                    break;
                case 3:
                    test_type = '解答题';
                    break;
            }
            return test_type;
        },

        AnswerType: function(answer_type) {
            switch (answer_type) {
                case 1:
                    answer_type = '正确';
                    break;
                case 2:
                    answer_type = '错误';
                    break;
                case 3:
                    answer_type = '20%正确';
                    break;
                case 4:
                    answer_type = '50%正确';
                    break;
                case 5:
                    answer_type = '80%正确';
                    break;
                case 6:
                    answer_type = '10%正确';
                    break;
                case 7:
                    answer_type = '30%正确';
                    break;
                case 8:
                    answer_type = '40%正确';
                    break;
                case 9:
                    answer_type = '60%正确';
                    break;
                case 10:
                    answer_type = '70%正确';
                    break;
                case 11:
                    answer_type = '90%正确';
                    break;
                case 0:
                    answer_type = '待批阅';
                    break;
            }
            return answer_type;
        },


        unique: function(arr) {
            var res = [];
            var json = {};
            for (var i = 0; i < arr.length; i++) {
                if (!json[arr[i]]) {
                    res.push(arr[i]);
                    json[arr[i]] = 1;
                }
            }
            return arr;
        },


        removeByValue: function(arr, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) {
                    arr.splice(i, 1);
                    break;
                }
            }
        },

        ActionSheet: function(option, cb) {

            var options = {
                buttonLabels: ['拍照', '从相册选择'],
                addCancelButtonWithLabel: '取消',
                androidEnableCancelButton: true,
                winphoneEnableCancelButton: true
            };
            if (typeof option == 'function') {
                cb = option;
            } else {
                angular.extend(options, option || {});
            }
            if (ionic.Platform.isAndroid()) {
                $ionicActionSheet.show({
                    buttons: [
                        { text: options.buttonLabels[0] },
                        { text: options.buttonLabels[1] }
                    ],
                    cancelText: '取消',
                    buttonClicked: function(index) {
                        cb(index);
                        return true;
                    }
                });

            } else {

                document.addEventListener("deviceready", function() {
                    $cordovaActionSheet.show(options)
                    .then(function(btnIndex) {
                        switch (btnIndex) {
                            case 1:
                                cb(0);
                                break;

                            case 2:
                                cb(1);
                                break;

                            default:
                                break;
                        }
                    });
                }, false);

            }
        },
        confirm: function(content, cb) {
            var showConfirm = function() {
                var confirmPopup = $ionicPopup.confirm({
                    title: '温馨提示',
                    template: content,
                    okText: '确认',
                    cancelText: '取消',
                    cancelType: 'button-clear',
                    okType: 'button-clear'
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        cb(res);
                    } else {
                        cb(null);
                    }
                });
            };
            showConfirm();
        },

        Modal: function(option, cb) {
            var showPopup = $ionicPopup.show({
                title: option.title,
                cssClass: option.cssClass,
                subTitle: option.subTitle,
                template: option.template,
                templateUrl: option.templateUrl,
                scope: option.scope,
                buttons: angular.merge([{
                    text: '确认',
                    type: 'button-clear ensure',
                    onTap: function(e) {
                        if (angular.isFunction(option.ensure) && !option.ensure()) {
                            return e.preventDefault();
                        }
                        return option.scope || true;
                    }
                }, {
                    text: '取消',
                    type: 'button-clear',
                    onTap: function(e) {
                        //e.preventDefault();
                    }
                }], option.buttons || {})
            });
            showPopup.then(function(res) {
                if (res) {
                    cb(res);
                } else {
                    cb(null);
                }
            });
        },

        bootstrap: function() {

            $ionicPlatform.ready(function() {
                if (ionic.Platform.isAndroid()) {
                    $timeout(function() {
                        $rootScope.animate = true;
                        var hideAnimate = setInterval(function() {
                            navigator.splashscreen.status(function(res) {
                                if (res == 'true') {
                                    $cordovaSplashscreen.hide();
                                    clearInterval(hideAnimate);
                                }
                            });
                        }, 100);
                    }, 100);
                } else {

                    $timeout(function() {
                        $rootScope.animate = true;
                        var hideAnimate = setInterval(function() {
                            navigator.splashscreen.status(function(res) {
                                console.log('test::::', res);
                                if (res == true) {
                                    $cordovaSplashscreen.hide();
                                    clearInterval(hideAnimate);
                                }
                            });
                        }, 100);
                    }, 100);
                }
            });
        },

        loadJs: function (id, url, callback) {
            var nodeHead = document.getElementsByTagName('head')[0];
            var nodeScript = null;
            if (document.getElementById(id) == null) {
                nodeScript = document.createElement('script');
                nodeScript.setAttribute('type', 'text/javascript');
                nodeScript.setAttribute('src', url);
                nodeScript.setAttribute('id', id);
                if (callback != null) {
                    nodeScript.onload = nodeScript.onreadystatechange = function() {
                        if (nodeScript.ready) {
                            return false;
                        }
                        if (!nodeScript.readyState || nodeScript.readyState == "loaded" || nodeScript.readyState == 'complete') {
                            nodeScript.ready = true;
                            callback();
                        }
                    }
                }
                nodeHead.appendChild(nodeScript);
            } else {
                callback && callback();
            }
        },

        replaceText: function(item){

            item.content.topic = this.resetImg(item.content.topic, true);
            item.content.options_a = this.resetImg(item.content.options_a);
            item.content.options_b = this.resetImg(item.content.options_b);
            item.content.options_c = this.resetImg(item.content.options_c);
            item.content.options_d = this.resetImg(item.content.options_d);
            item.content.options_e = this.resetImg(item.content.options_e);
            item.content.options_f = this.resetImg(item.content.options_f);
            item.content.solution = this.resetImg(item.content.solution, true);
            if(item.test_type == 3){
                item.content.answer = this.resetImg(item.content.answer, true);
            }
            return item;
        },

        /*
        *  不使用mathjs时需添加 $sce.trustAsHtml
        *  type:
        *     true   ->时图片加载失败替换为错误文字提示并可点击重新加载
        *     false  ->图片加载失败仅做自动重新
        */
        resetImg : function(data, type){

            return type ? $sce.trustAsHtml(data.toString().replace(/src=/g, 'onerror="imageLoadedFailure(this, true)" onload="imageLoadedComplate(this, true)" src=')):
                $sce.trustAsHtml(data.toString().replace(/src=/g, 'onerror="imageLoadedFailure(this)" onload="imageLoadedComplate(this)" src='));
        },

        DefaultCheck : function(item, check) {
            switch (item.test_type) {
                case 1:
                    if (check[0]) {
                        item.check = check[0];
                    }
                    break;
                case 2:
                    item.check = check;
                    break;
                case 3:
                    item.check = check;
                    break;
            }
        }

    }
})
