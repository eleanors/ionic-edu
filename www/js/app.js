var starter = angular.module('starter', [
    'ionic',
    'ngCordova',
    'ngStorage',
    'starter.constant',
    'starter.route',
    'starter.controllers',
    'starter.services',
    'starter.directive',
    'starter.factories',
    'starter.filter',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'com.2fdevs.videogular.plugins.overlayplay',
    'com.2fdevs.videogular.plugins.poster',
    'com.2fdevs.videogular.plugins.buffering',
])
.run(['$ionicPlatform', '$rootScope', '$location', '$timeout', '$ionicHistory', '$cordovaKeyboard', 'Public', '$cordovaStatusbar', '$cordovaDevice', '$cordovaNetwork', '$window', 'Request',function($ionicPlatform, $rootScope, $location, $timeout, $ionicHistory, $cordovaKeyboard, Public, $cordovaStatusbar, $cordovaDevice ,$cordovaNetwork, $window, Request) {

    $ionicPlatform.ready(function() {

        var device = $cordovaDevice.getDevice();
        var network = $cordovaNetwork.getNetwork();
        var type = ['unknown', 'NONE', 'ETHERNET', 'wifi', '2g', '3g', '4g'];
        network = type.indexOf(network);

        $rootScope.info = {
            model: device.model,
            vendor: device.manufacturer,
            os_version: device.version,
            network_type: network,
            width: $window.screen.width,
            height: $window.screen.height
        };

        Request.checkToken({
            unloading: true,
            info: JSON.stringify($rootScope.info)
        }).then(function(res){
            console.log(res);
        });

        console.log($rootScope.info);
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {

            cordova.plugins.Keyboard.disableScroll(true);
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            //StatusBar.styleLightContent();
            //设置全屏
            $cordovaStatusbar.style(true);
            $cordovaStatusbar.overlaysWebView(true);
        }
    });

    //物理返回按钮控制&双击退出应用
    $ionicPlatform.registerBackButtonAction(function(e) {
        //判断处于哪个页面时双击退出
        if ($location.path() == '/main/grade' || $location.path() == '/login') {
            if ($rootScope.backButtonPressedOnceToExit) {
                ionic.Platform.exitApp();
            } else {
                $rootScope.backButtonPressedOnceToExit = true;
                Public.Toast('再按一次退出应用');
                setTimeout(function() {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }
        } else if ($ionicHistory.backView()) {
            if ($cordovaKeyboard.isVisible()) {
                $cordovaKeyboard.close();
            } else {
                $ionicHistory.goBack();
            }
        } else {
            $rootScope.backButtonPressedOnceToExit = true;
            Public.Toast('再按一次退出应用');
            setTimeout(function() {
                $rootScope.backButtonPressedOnceToExit = false;
            }, 2000);
        }
        e.preventDefault();
        return false;
    }, 101);
}])

.run(["$rootScope", "$location", "$state", "AuthService", function($rootScope, $location, $state, AuthService) {

    if (AuthService.isLogin() && $state.current.name == '') {
        $location.path('/main/grade');
    }
    $rootScope.$on("$stateChangeStart", function(event, toState) {
        if (AuthService.isLogin() && $location.path() == '/login') {
            event.preventDefault();
        }
    });
    $rootScope.$on("$stateChangeSuccess", function(event, state) {})
}])

.run(function($ionicPlatform, $cordovaStatusbar, $ionicLoading, Public, Request, $rootScope, Config, $timeout, $cordovaFileTransfer, $ionicPopup, $cordovaFileOpener2) {

    $rootScope.animate = false;
    if (ionic.Platform.navigator.platform == 'Win32') {
        $rootScope.animate = true;
    }

    $ionicPlatform.ready(function() {

        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            //设置屏幕常亮
            plugins.insomnia.keepAwake(function() {
                console.log('常亮成功');
            }, function() {
                console.log('常亮失败');
            });

            var app = {

                // Application Constructor
                initialize: function() {
                    this.bindEvents();
                },

                bindEvents: function() {
                    document.addEventListener('deviceready', this.onDeviceReady, false);
                    document.addEventListener('chcp_updateIsReadyToInstall', this.onUpdateReady, false);
                },

                onDeviceReady: function() {
                    // $ionicLoading.show({
                    //     template: '<ion-spinner></ion-spinner><br>正在更新，请稍候...'
                    // });
                    console.log('Device is ready for work');
                },

                onUpdateReady: function() {
                    // $ionicLoading.show({
                    //     template: '<ion-spinner></ion-spinner><br>正在更新，请稍候...'
                    // });
                    console.log('Update is ready for installation');

                    cordova.plugins.notification.local.schedule({
                        title: '应用更新完成',
                        text: '重启应用后更新',
                        foreground: true
                    });
                }
            };

            app.initialize();
            //热更新
            if (ionic.Platform.isAndroid()) {
                $rootScope.client_type = 2;
            } else {
                $rootScope.client_type = 1;
            }


            Request.Version({
                version_code: Config.version_code,
                client_type: $rootScope.client_type,
                customer_type: 2,
                unloading: true
            }).then(function(result) {

                if (result) {
                    var is_update = result.update_level;
                    var update_type = result.update_type;
                    if (is_update >= 1) {
                        //判断是否更新
                        if (update_type === 1) {
                            //资源更新
                            return update_resource(result.update_url);
                        }
                        if (update_type === 2) {
                            //APP更新
                            if (ionic.Platform.isAndroid()) {
                                return update_apk(result.update_url, result.update_content);
                            } else {
                                update_APPSTORE(result.update_url, result.update_content);
                                //todo IOS和安卓区分
                            }

                        }
                    }
                }
            });

            function update_APPSTORE(url, info) {

                var confirmPopup = $ionicPopup.alert({
                    title: '发现新版本',
                    okText: '立即体验',
                    okType: 'button-clear',
                    template: info.toString().replace(/\n/g, '<br />')
                });
                confirmPopup.then(function(res) {
                    if (res) {

                        return cordova.InAppBrowser.open('https://itunes.apple.com/us/app/%E7%A7%A6%E5%AD%A6%E4%BA%91%E8%AF%BE%E5%A0%82%E5%AD%A6%E7%94%9F/id1232989795?mt=8', '_blank', 'location=no,toolbar=yes,toolbarposition=top,closebuttoncaption=关闭');

                    }
                });
            }
            //资源更新
            function update_resource(update_url) {
                console.log('test', update_url);
                if (!update_url) return;

                chcp.fetchUpdate(function(res) {
                    console.log('error', res);
                }, {
                    'config-file': update_url
                });
            }


            function update_apk(url, info) {
                var confirmPopup = $ionicPopup.alert({
                    title: '发现新版本',
                    okText: '立即体验',
                    okType: 'button-clear',
                    template: info.toString().replace(/\n/g, '<br />')
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        $rootScope.process = 0;
                        $ionicLoading.show({
                            template: '<ion-spinner icon="bubbles" class="spinner-assertive spinner spinner-bubbles"></ion-spinner><br>正在下载：{{process}}%'
                        });
                        var targetPath = cordova.file.externalDataDirectory + "update.apk"; //APP下载存放的路径，可以使用cordova file插件进行相关配置
                        var trustHosts = true;
                        var options = {};
                        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function(result) {
                            // 打开下载下来的APP
                            $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive').then(function() {

                            }, function(err) {

                            });
                            $ionicLoading.hide();
                        }, function(err) {
                            console.log(err);
                            $ionicLoading.hide();
                            Public.Toast('新版本下载失败');
                        }, function(progress) {
                            //进度，这里使用文字显示下载百分比
                            $timeout(function() {
                                var downloadProgress = (progress.loaded / progress.total) * 100;
                                $rootScope.process = Math.floor(downloadProgress);
                                if (downloadProgress > 99) {
                                    $ionicLoading.hide();
                                }
                            });
                        });

                    } else {
                        // 取消更新
                    }
                });
            }
            Public.bootstrap();
        }
    });
})


.run(function($ionicPlatform, Notification, Config) {

    $ionicPlatform.ready(function() {
        if (window.cordova && window.GeTuiSdkPlugin || window.GeTuiSdk) {
            Notification.initialize();
            //umeng
            MobclickAgent.init(Config.umengAPPKEY, "Web");
        }
    });
})

.factory('Notification', ['$rootScope', 'Config', function($rootScope, Config) {

    var secret = Config.getui99;

    var notification = {
        _isPushModeOff: false,

        initialize: function() {

            notification.bindEvents();
        },

        bindEvents: function() {
            document.addEventListener('deviceready', notification.onDeviceReady, false);
        },

        onDeviceReady: function() {
            ionic.Platform.isAndroid() ? notification.startNotifyForAnd()
                : notification.startNotifyForIos();
        },

        registerRemoteNotification: function() {
            var options = {
                ios: {
                    alert: "true",
                    badge: "true",
                    sound: "true"
                }
            };

            var push = PushNotification.init(options);

            var onRegistration = function(data) {
                console.log(data.registrationId + ' deviceToken');
                GeTuiSdk.registerDeviceToken(data.registrationId);
            };
            push.on('registration', onRegistration);

            var onNotification = function(data) {
                var date = new Date();
                var dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                app.log('[APN] ' + dateStr + 'title:' + data.title + ' message:' + data.message);
            };
            push.on('notification', onNotification);

            var onError = function(e) {
                GeTuiSdk.registerDeviceToken('');
                app.log('didFailToRegisterForRemoteNotificationsWithError' + e.message);
            };
            push.on('error', onError);
        },

        onRegisterClient: function(clientId) {
            $rootScope.device_id = clientId;
        },

        startGeTuiSdk: function() {
            GeTuiSdk.startSdkWithAppId(secret.AppId, secret.AppKey, secret.AppSecret);
        },

        onReceivePayload: function(payloadData, taskId, msgId, offLine, appId) {
            app.log('payloadData:' + payloadData)
        },

        onSendMessage: function(messageId, result) {
            app.log('SendMessage:' + messageId + 'result:' + result);
        },

        onOccurError: function(err) {
            app.log('OccurError Error code:' + err.code + ' error desc:' + err.desc);
        },

        onNotifySdkState: function(status) {
            var callback = function(status) {
                switch (status) {
                    case GeTuiSdk.GeTuiSdkStatus.KSdkStatusStarting:
                        // starting
                        break;
                    case GeTuiSdk.GeTuiSdkStatus.KSdkStatusStarted:
                        // started
                        break;
                    case GeTuiSdk.GeTuiSdkStatus.KSdkStatusStoped:
                        // stoped
                        break;
                    default:
                        break;
                }
            };

            GeTuiSdk.status(callback);
        },

        onSetPushMode: function(isModeOff, err) {
            if (err != null) {
                app.log('SetPushMode Error code:' + err.code + ' error desc:' + err.desc);
            } else {
                _isPushModeOff = isModeOff;
                localStorage.setItem('isPushModeOff', _isPushModeOff);
                notification.updatePushModeView(isModeOff);
            }
        },

        onSetAliasAction: function(action, isSuccess, aSn, err) {
            if (err != null) {
                app.log('SetPushMode Error code:' + err.code + ' error desc:' + err.desc);
            } else {
                app.log('action ->' + action + ' isSuccess ->' + isSuccess + ' sn ->' + aSn);
            }
        },

        updatePushModeView: function(isModeOff) {
            if (isModeOff) {
                // opened push
            } else {
                // closed push
            }
        },

        startNotifyForIos: function(){
            var isPushModeOff = localStorage.getItem('isPushModeOff');
            if (isPushModeOff != null) {
                _isPushModeOff = isPushModeOff;
            } else {
                _isPushModeOff = false;
            }

            notification.updatePushModeView(_isPushModeOff);

            var updateVersion = function(version) {
                console.log(version)
            };
            GeTuiSdk.version(updateVersion);
            GeTuiSdk.setGeTuiSdkDidRegisterClientCallback(notification.onRegisterClient);
            GeTuiSdk.setGeTuiSdkDidReceivePayloadCallback(notification.onReceivePayload);
            GeTuiSdk.setGeTuiSdkDidSendMessageCallback(notification.onSendMessage);
            GeTuiSdk.setGeTuiSdkDidOccurErrorCallback(notification.onOccurError);
            GeTuiSdk.setGeTuiSDkDidNotifySdkStateCallback(notification.onNotifySdkState);
            GeTuiSdk.setGeTuiSdkDidSetPushModeCallback(notification.onSetPushMode);
            GeTuiSdk.setGeTuiSdkDidAliasActionCallback(notification.onSetAliasAction);

            notification.startGeTuiSdk();
            notification.registerRemoteNotification();
        },

        startNotifyForAnd: function(){
            var callback = function(type, data){
                if(type == 'cid'){
                    $rootScope.device_id = data;
                }else if(type == 'pid'){

                }else if(type == 'payload'){

                }else if(type == 'online'){
                    if (data == 'true') {
                        console.log('已上线');
                    } else {
                        console.log('已离线');
                    }
                }else {}
            }
            GeTuiSdkPlugin.callback_init(callback);
            GeTuiSdkPlugin.initialize(secret.AppId);
        }
    }

    return notification;
}])
